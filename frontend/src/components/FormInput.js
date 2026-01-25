export const FormInput = ({ label, name, type = 'text', placeholder = '', required = false, accept = '' }) => {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  group.innerHTML = `
    <label for="${name}">${label}${required ? '*' : ''}</label>
    <input 
      type="${type}" 
      name="${name}" 
      id="${name}" 
      placeholder="${placeholder}" 
      ${required ? 'required' : ''} 
      ${accept ? `accept="${accept}"` : ''}
    >
  `;
  
  return group;
};

export const FormTextArea = ({ label, name, rows = 4, placeholder = '', required = false }) => {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  group.innerHTML = `
    <label for="${name}">${label}${required ? '*' : ''}</label>
    <textarea 
      name="${name}" 
      id="${name}" 
      rows="${rows}" 
      placeholder="${placeholder}" 
      ${required ? 'required' : ''}
    ></textarea>
  `;
  
  return group;
};
