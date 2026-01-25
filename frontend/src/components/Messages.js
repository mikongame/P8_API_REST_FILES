export const ErrorMessage = (message, onClose) => {
  const error = document.createElement('div');
  error.className = 'error-message';
  error.innerHTML = `
    <p>❌ ${message}</p>
    <button class="close-btn">✕</button>
  `;
  
  error.querySelector('.close-btn').addEventListener('click', () => {
    error.remove();
    if (onClose) onClose();
  });
  
  return error;
};

export const SuccessMessage = (message, onClose) => {
  const success = document.createElement('div');
  success.className = 'success-message';
  success.innerHTML = `
    <p>✓ ${message}</p>
    <button class="close-btn">✕</button>
  `;
  
  success.querySelector('.close-btn').addEventListener('click', () => {
    success.remove();
    if (onClose) onClose();
  });
  
  return success;
};
