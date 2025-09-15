const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, refreshTokenSecret, refreshTokenExpiresIn } = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}
function signRefreshToken(payload) {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: refreshTokenExpiresIn });
}
function verifyAccessToken(token) { return jwt.verify(token, jwtSecret); }
function verifyRefreshToken(token) { return jwt.verify(token, refreshTokenSecret); }

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };




