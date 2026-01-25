import { apiFetch } from '../../utils/api.js';
import { isAuthenticated, getUser } from '../../utils/auth.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { ErrorMessage, SuccessMessage } from '../../components/Messages.js';
import { formatDate } from '../../utils/helpers.js';
import './EventDetail.css';

export const EventDetail = async (params) => {
  const eventId = params.eventId; // Mismatch fixed here
  const container = document.createElement('div');
  container.className = 'event-detail-page';
  
  container.appendChild(LoadingSpinner());
  
  try {
    const event = await apiFetch(`/events/${eventId}`);
    const user = getUser();
    const isCreator = user && event.createdBy._id === user._id;
    const isAttending = user && event.attendees.some(a => a._id === user._id);
    
    container.innerHTML = `
      <div class="event-detail-container">
        <div class="event-header">
          ${event.poster ? `<img src="${event.poster}" alt="${event.title}" class="event-poster">` : ''}
          <div class="event-header-info">
            <h1>${event.title}</h1>
            <p class="event-meta">📅 ${formatDate(event.date)}</p>
            <p class="event-meta">📍 ${event.location}</p>
            <p class="event-meta">👥 ${event.attendees.length} asistente${event.attendees.length !== 1 ? 's' : ''}</p>
            <p class="event-meta">👤 Organizador: ${event.createdBy.name}</p>
          </div>
        </div>
        
        ${event.description ? `<div class="event-description"><p>${event.description}</p></div>` : ''}
        
        <div class="event-actions">
          ${isCreator ? `
            <button id="edit-event-btn" class="btn-secondary">Editar Evento</button>
            <button id="delete-event-btn" class="btn-danger">Eliminar Evento</button>
          ` : isAuthenticated() ? `
            ${isAttending ? 
              '<button id="leave-event-btn" class="btn-danger">Cancelar Asistencia</button>' : 
              '<button id="attend-event-btn" class="btn-primary">Confirmar Asistencia</button>'
            }
          ` : '<p class="login-prompt">Inicia sesión para confirmar asistencia</p>'}
        </div>
        
        <div class="event-sections">
          <div class="section">
            <h2>Tareas Organizativas</h2>
            <div id="tasks-list">
              ${event.tasks.length > 0 ? 
                event.tasks.map(task => `
                  <div class="task-item ${task.done ? 'done' : ''}">
                    <input type="checkbox" ${task.done ? 'checked' : ''} disabled>
                    <span>${task.name}</span>
                  </div>
                `).join('') :
                '<p class="empty-state">No hay tareas todavía</p>'
              }
            </div>
            ${isCreator ? `
              <div class="add-task-container">
                <input type="text" id="new-task-name" placeholder="Nueva tarea...">
                <button id="add-task-btn" class="btn-secondary">Añadir</button>
              </div>
            ` : ''}
          </div>
          
          <div class="section">
            <h2>Asistentes</h2>
            <div id="attendees-list">
              ${event.attendees.length > 0 ?
                event.attendees.map(attendee => `
                  <div class="attendee-item">
                    <span>${attendee.name}</span>
                    ${attendee.email ? `<small>${attendee.email}</small>` : ''}
                  </div>
                `).join('') :
                '<p class="empty-state">No hay asistentes todavía</p>'
              }
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add task logic
    const addTaskBtn = container.querySelector('#add-task-btn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', async () => {
        const input = container.querySelector('#new-task-name');
        const name = input.value.trim();
        if (!name) return;

        try {
          addTaskBtn.disabled = true;
          addTaskBtn.textContent = '...';
          await apiFetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({ name, eventId })
          });
          window.location.reload();
        } catch (error) {
          container.prepend(ErrorMessage(error.message));
          addTaskBtn.disabled = false;
          addTaskBtn.textContent = 'Añadir';
        }
      });
    }

    // Edit event
    const editBtn = container.querySelector('#edit-event-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        // En una SPA real, esto pasaría params a CreateEvent
        window.history.pushState({ eventId }, '', '/create-event');
        // Para simplificar en este router custom, usamos una variable global o similar
        // Pero para el propósito de este ejercicio, CreateEvent aceptará el ID de la URL o estado
        sessionStorage.setItem('editEventId', eventId);
        window.navigateTo('/create-event');
      });
    }

    // ... rest of event listeners (attend, leave, delete) ...

    // Attend event
    const attendBtn = container.querySelector('#attend-event-btn');
    if (attendBtn) {
      attendBtn.addEventListener('click', async () => {
        try {
          await apiFetch(`/events/${eventId}/attend`, { method: 'POST' });
          container.prepend(SuccessMessage('Asistencia confirmada'));
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          container.prepend(ErrorMessage(error.message));
        }
      });
    }
    
    // Leave event
    const leaveBtn = container.querySelector('#leave-event-btn');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', async () => {
        try {
          await apiFetch(`/events/${eventId}/leave`, { method: 'DELETE' });
          container.prepend(SuccessMessage('Asistencia cancelada'));
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          container.prepend(ErrorMessage(error.message));
        }
      });
    }
    
    // Delete event
    const deleteBtn = container.querySelector('#delete-event-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('¿Estás seguro de eliminar este evento?')) {
          try {
            await apiFetch(`/events/${eventId}`, { method: 'DELETE' });
            alert('Evento eliminado');
            window.navigateTo('/');
          } catch (error) {
            container.prepend(ErrorMessage(error.message));
          }
        }
      });
    }
    
  } catch (error) {
    container.innerHTML = '';
    container.appendChild(ErrorMessage('Error al cargar evento: ' + error.message));
  }
  
  return container;
};
