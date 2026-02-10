const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      ...(!(options.body instanceof FormData) && {
        'Content-Type': 'application/json'
      }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
