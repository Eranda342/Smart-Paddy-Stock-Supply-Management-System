const API_BASE_URL = "http://localhost:5000/api";

export const API = {
  login: `${API_BASE_URL}/users/login`,
  register: `${API_BASE_URL}/users/register`,
  listings: `${API_BASE_URL}/listings`,
  negotiations: `${API_BASE_URL}/negotiations`,
  transactions: `${API_BASE_URL}/transactions`,
  transports: `${API_BASE_URL}/transports`,
  forgotPassword: `${API_BASE_URL}/users/forgot-password`,
  resetPassword: `${API_BASE_URL}/users/reset-password`
};