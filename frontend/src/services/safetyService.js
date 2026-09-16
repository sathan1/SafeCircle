const API_URL = 'http://localhost:5000/api/safety';

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
