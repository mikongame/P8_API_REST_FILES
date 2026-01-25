import { apiFetch } from '../../utils/api.js';
import { isAuthenticated } from '../../utils/auth.js';
import { EventCard } from '../../components/EventCard.js';
import { LoadingSpinner } from '../../components/LoadingSpinner.js';
import { ErrorMessage } from '../../components/Messages.js';
import './EventList.css';

export const EventList = async () => {
  const container = document.createElement('div');
  container.className = 'event-list-page';
  
  container.innerHTML = `
    <div class="page-header">
      <h1>Descubre Eventos</h1>
      ${isAuthenticated() ? '<button id="create-event-btn" class="btn-primary">+ Crear Evento</button>' : '<p class="login-prompt">Inicia sesión para crear eventos</p>'}
    </div>
    
    <div class="filters">
      <select id="sort-select">
        <option value="date-asc">Fecha: Pr\u00f3ximos</option>
        <option value="date-desc">Fecha: M\u00e1s lejanos</option>
        <option value="attendees-desc">M\u00e1s populares</option>
        <option value="attendees-asc">Menos populares</option>
      </select>
    </div>
    
    <div id="events-container"></div>
  `;
  
  // Setup create event button
  const createBtn = container.querySelector('#create-event-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      window.navigateTo('/create-event');
    });
  }
  
  // Setup sorting
  container.querySelector('#sort-select').addEventListener('change', async (e) => {
    const [sortBy, order] = e.target.value.split('-');
    await loadEvents(container, sortBy, order);
  });
  
  // Load initial events
  await loadEvents(container);
  
  return container;
};

async function loadEvents(container, sortBy = 'date', order = 'asc') {
  const eventsContainer = container.querySelector('#events-container');
  eventsContainer.innerHTML = '';
  eventsContainer.appendChild(LoadingSpinner());
  
  try {
    const events = await apiFetch(`/events?sortBy=${sortBy}&order=${order}`);
    
    eventsContainer.innerHTML = '';
    
    if (events.length === 0) {
      eventsContainer.innerHTML = '<p class="no-events">No hay eventos disponibles todavía</p>';
      return;
    }
    
    const grid = document.createElement('div');
    grid.className = 'events-grid';
    
    events.forEach(event => {
      grid.appendChild(EventCard(event));
    });
    
    eventsContainer.appendChild(grid);
  } catch (error) {
    eventsContainer.innerHTML = '';
    eventsContainer.appendChild(ErrorMessage('Error al cargar eventos: ' + error.message));
  }
}
