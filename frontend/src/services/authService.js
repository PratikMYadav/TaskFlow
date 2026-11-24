import api from './api';

export const authService = {
  async register(fullName, email, password, confirmPassword) {
    const response = await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async changePassword(oldPassword, newPassword, confirmNewPassword) {
    const response = await api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    });
    return response.data;
  },

  async updateProfile(fullName) {
    const response = await api.put('/users/profile', {
      full_name: fullName,
    });
    return response.data;
  },
};
