const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const sendEmail = require('../services/email.service');
const addMinutes = (mins) => new Date(Date.now() + mins*60*1000);

async function register(req, res, next) {
  try {
    const { name, email, password, phone, role } = req.body;
    
    // Input validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: 'Email already exists' });
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ 
      data: { 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        phone: phone?.trim(), 
        passwordHash, 
        role: role === 'RESTAURANT_OWNER' ? 'RESTAURANT_OWNER' : 'USER' 
      } 
    });
    
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await prisma.refreshToken.create({ 
      data: { token: refreshToken, userId: user.id, expiresAt } 
    });
    
    // Send welcome email notification
    await sendEmail(
      user.email,
      'Welcome to TableTrek! 🎉',
      `Hi ${user.name},\n\nWelcome to TableTrek! Your account has been successfully created.\n\nYou can now:\n• Browse and discover amazing restaurants\n• Make reservations instantly\n• Join waitlists when tables are full\n• Leave reviews and ratings\n\nThank you for choosing TableTrek for your dining experiences!\n\nBest regards,\nThe TableTrek Team`
    );
    
    res.status(201).json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      tokens: { accessToken, refreshToken } 
    });
  } catch (err) { 
    next(err); 
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    await prisma.refreshToken.create({ 
      data: { token: refreshToken, userId: user.id, expiresAt } 
    });
    
    // Send login notification email
    const loginTime = new Date().toISOString();
    await sendEmail(
      user.email,
      'Login Notification - TableTrek',
      `Hi ${user.name},\n\nYou have successfully logged into your TableTrek account.\n\nLogin Time: ${loginTime} UTC\n\nIf this wasn't you, please contact our support team immediately.\n\nHappy dining!\nThe TableTrek Team`
    );
    
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role }, 
      tokens: { accessToken, refreshToken } 
    });
  } catch (err) { 
    next(err); 
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' });
    // verify signature
    const payload = verifyRefreshToken(refreshToken);
    // check DB for token & not revoked
    const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!dbToken || dbToken.revoked) return res.status(401).json({ message: 'Invalid refresh token' });
    // optionally revoke old token for rotation
    await prisma.refreshToken.update({ where: { token: refreshToken }, data: { revoked: true } });
    const newAccess = signAccessToken({ sub: payload.sub, role: payload.role });
    const newRefresh = signRefreshToken({ sub: payload.sub, role: payload.role });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId: payload.sub, expiresAt } });
    res.json({ tokens: { accessToken: newAccess, refreshToken: newRefresh } });
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, role: true, phone: true } });
    res.json({ user });
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, me };
