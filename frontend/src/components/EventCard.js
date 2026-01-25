import { formatDate } from '../utils/helpers.js';

export const EventCard = (event) => {
  const card = document.createElement('div');
  card.className = 'event-card';
  
  const formattedDate = formatDate(event.date);
  const attendeesCount = event.attendees?.length || 0;
  
  card.innerHTML = `
    <div class="event-card-image">
      <img src="${event.poster || '/frontend/assets/default-event.jpg'}" alt="${event.title}">
    </div>
    <div class="event-card-content">
      <h3 class="event-title">${event.title}</h3>
      <p class="event-date">📅 ${formattedDate}</p>
      <p class="event-location">📍 ${event.location}</p>
      <p class="event-attendees">👥 ${attendeesCount} asistente${attendeesCount !== 1 ? 's' : ''}</p>
      <button class="btn-primary" data-event-id="${event._id}">Ver Detalles</button>
    </div>
  `;
  
  card.querySelector('button').addEventListener('click', () => {
    window.navigateTo(`/event/${event._id}`);
  });
  
  return card;
};
