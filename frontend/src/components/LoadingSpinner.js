export const LoadingSpinner = () => {
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  spinner.innerHTML = `
    <div class="spinner"></div>
    <p>Cargando...</p>
  `;
  return spinner;
};
