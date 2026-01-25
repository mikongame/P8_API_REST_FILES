import { apiFetch } from '../../utils/api.js';
import { isAuthenticated, getUser } from '../../utils/auth.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { ErrorMessage, SuccessMessage } from '../../components/Messages.js';
import { formatDate } from '../../utils/helpers.js';
import { FormInput, FormTextArea } from '../../components/FormInput.js';
import './CreateEvent.css';

export const CreateEvent = () => {
  const eventId = sessionStorage.getItem('editEventId');
  const container = document.createElement('div');
  container.className = 'create-event-page';
  
  if (!isAuthenticated()) {
    window.navigateTo('/login');
    return container;
  }
  
  container.innerHTML = `
    <div class="create-event-container">
      <h1>${eventId ? 'Editar Evento' : 'Crear Nuevo Evento'}</h1>
      <form id="event-form" class="event-form">
        <div id="form-fields"></div>
        <div class="form-actions">
          <button type="button" id="cancel-btn" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">${eventId ? 'Guardar Cambios' : 'Crear Evento'}</button>
        </div>
      </form>
    </div>
  `;

  // Render fields
  const fields = container.querySelector('#form-fields');
  fields.appendChild(FormInput({ label: 'Título del Evento', name: 'title', required: true, placeholder: 'Ej: Noche de la Hamburguesa' }));
  fields.appendChild(FormTextArea({ label: 'Descripción', name: 'description', placeholder: 'Describe tu evento...' }));
  
  const row = document.createElement('div');
  row.className = 'form-row';
  row.appendChild(FormInput({ label: 'Fecha', name: 'date', type: 'date', required: true }));
  row.appendChild(FormInput({ label: 'Ubicación', name: 'location', required: true, placeholder: 'Ej: Casa de Juan' }));
  fields.appendChild(row);
  
  fields.appendChild(FormInput({ label: 'Cartel del Evento', name: 'poster', type: 'file', accept: 'image/*' }));

  
  // Cancel button
  container.querySelector('#cancel-btn').addEventListener('click', () => {
    sessionStorage.removeItem('editEventId');
    window.navigateTo('/');
  });
  
  // Form submission
  container.querySelector('#event-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      // Remove previous messages
      form.querySelectorAll('.error-message, .success-message').forEach(m => m.remove());
      
      // Show loading
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = eventId ? 'Guardando...' : 'Creando...';
      
      const endpoint = eventId ? `/events/${eventId}` : '/events';
      const method = eventId ? 'PUT' : 'POST';
      
      await apiFetch(endpoint, {
        method,
        body: formData
      });
      
      sessionStorage.removeItem('editEventId');
      form.prepend(SuccessMessage(`Evento ${eventId ? 'actualizado' : 'creado'} exitosamente`));
      
      setTimeout(() => {
        window.navigateTo('/');
      }, 1500);
    } catch (error) {
      form.prepend(ErrorMessage(error.message));
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = false;
      btn.textContent = eventId ? 'Guardar Cambios' : 'Crear Evento';
    }
  });
  
  // If editing, load event data
  if (eventId) {
    loadEventData(container, eventId);
  }
  
  return container;
};

async function loadEventData(container, eventId) {
  try {
    const event = await apiFetch(`/events/${eventId}`);
    const form = container.querySelector('#event-form');
    
    form.querySelector('[name="title"]').value = event.title;
    form.querySelector('[name="description"]').value = event.description || '';
    form.querySelector('[name="date"]').value = event.date.split('T')[0];
    form.querySelector('[name="location"]').value = event.location;
  } catch (error) {
    container.prepend(ErrorMessage('Error al cargar evento: ' + error.message));
  }
}
