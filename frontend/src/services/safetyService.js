const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safecircle-backend-38w8.onrender.com';
const API_URL = `${API_BASE_URL}/api/safety`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const safetyService = {
  async getTransitions(journeyId) {
    const response = await fetch(`${API_URL}/transitions/${journeyId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch safety transitions');
    return response.json();
  }
};

export default safetyService;
