import { getApiBaseUrl } from './apiConfig';

const getApiUrl = () => `${getApiBaseUrl()}/api/safety`;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const safetyService = {
  async getTransitions(journeyId) {
    const response = await fetch(`${getApiUrl()}/transitions/${journeyId}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch safety transitions');
    return response.json();
  }
};

export default safetyService;
