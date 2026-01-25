import { apiFetch } from '../../utils/api.js';
import { saveAuth } from '../../utils/auth.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { ErrorMessage, SuccessMessage } from '../../components/Messages.js';
import { validateEmail, validatePassword } from '../../utils/helpers.js';
import { FormInput } from '../../components/FormInput.js';

export const LoginRegister = () => {
  const container = document.createElement('div');
  container.className = 'login-register-page';
  
  container.innerHTML = `
    <div class="auth-container">
      <div class="auth-tabs">
        <button class="tab-btn active" data-tab="login">Iniciar Sesión</button>
        <button class="tab-btn" data-tab="register">Registrarse</button>
      </div>
      
      <div class="tab-content active" id="login-tab">
        <h2>Bienvenido de nuevo</h2>
        <form id="login-form" class="auth-form">
          <div id="login-fields"></div>
          <button type="submit" class="btn-primary">Entrar</button>
        </form>
      </div>
      
      <div class="tab-content" id="register-tab">
        <h2>Crear cuenta nueva</h2>
        <form id="register-form" class="auth-form">
          <div id="register-fields"></div>
          <button type="submit" class="btn-primary">Crear Cuenta</button>
        </form>
      </div>
    </div>
  `;

  // Render Login Fields
  const loginFields = container.querySelector('#login-fields');
  loginFields.appendChild(FormInput({ label: 'Email', name: 'email', type: 'email', placeholder: 'tu@email.com', required: true }));
  loginFields.appendChild(FormInput({ label: 'Contraseña', name: 'password', type: 'password', placeholder: '••••••••', required: true }));

  // Render Register Fields
  const registerFields = container.querySelector('#register-fields');
  registerFields.appendChild(FormInput({ label: 'Nombre', name: 'name', placeholder: 'Tu nombre', required: true }));
  registerFields.appendChild(FormInput({ label: 'Email', name: 'email', type: 'email', placeholder: 'tu@email.com', required: true }));
  registerFields.appendChild(FormInput({ label: 'Contraseña (mínimo 6 caracteres)', name: 'password', type: 'password', placeholder: '••••••••', required: true }));
  registerFields.appendChild(FormInput({ label: 'Avatar (opcional)', name: 'avatar', type: 'file', accept: 'image/*' }));

  
  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      container.querySelector(`#${tab}-tab`).classList.add('active');
    });
  });
  
  // Login handler
  container.querySelector('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Validation
    if (!validateEmail(data.email)) {
      form.prepend(ErrorMessage('Email inválido'));
      return;
    }
    
    try {
      // Remove previous messages
      form.querySelectorAll('.error-message, .success-message').forEach(m => m.remove());
      
      // Show loading
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Entrando...';
      
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      saveAuth(response.user, response.token);
      form.prepend(SuccessMessage('¡Bienvenido! Redirigiendo...'));
      
      setTimeout(() => {
        window.navigateTo('/');
      }, 1000);
    } catch (error) {
      form.prepend(ErrorMessage(error.message));
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
  
  // Register handler
  container.querySelector('#register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Validation
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!validateEmail(email)) {
      form.prepend(ErrorMessage('Email inválido'));
      return;
    }
    
    if (!validatePassword(password)) {
      form.prepend(ErrorMessage('La contraseña debe tener al menos 6 caracteres'));
      return;
    }
    
    try {
      // Remove previous messages
      form.querySelectorAll('.error-message, .success-message').forEach(m => m.remove());
      
      // Show loading
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Creando cuenta...';
      
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        body: formData
      });
      
      // Auto-login
      saveAuth(response.user, response.token);
      form.prepend(SuccessMessage('¡Cuenta creada! Redirigiendo...'));
      
      setTimeout(() => {
        window.navigateTo('/');
      }, 1000);
    } catch (error) {
      form.prepend(ErrorMessage(error.message));
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = 'Crear Cuenta';
    }
  });
  
  return container;
};
