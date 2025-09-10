// Toast notification utility
export const showToast = (message, type = 'success', duration = 4000) => {
  const toast = document.createElement('div');
  
  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  const icon = type === 'success' ? '✅' : 
               type === 'error' ? '❌' : 
               type === 'warning' ? '⚠️' : 'ℹ️';
  
  toast.innerHTML = `${icon} ${message}`;
  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-0 opacity-100`;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(full)';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, duration);
};

export const showSuccess = (message, duration = 4000) => showToast(message, 'success', duration);
export const showError = (message, duration = 5000) => showToast(message, 'error', duration);
export const showWarning = (message, duration = 4000) => showToast(message, 'warning', duration);
export const showInfo = (message, duration = 3000) => showToast(message, 'info', duration);
