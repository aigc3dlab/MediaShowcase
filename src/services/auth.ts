import api from './api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  username: string;
}

export const authService = {
  login: (data: LoginData) => 
    api.post('/auth/login', data),
  
  register: (data: RegisterData) =>
    api.post('/auth/register', data),
    
  getCurrentUser: () =>
    api.get('/users/profile'),
}; 