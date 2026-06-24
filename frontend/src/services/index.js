import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login/', { email, password }),
  register: (data) => api.post('/auth/register/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  requestPasswordReset: (email) => api.post('/auth/password-reset/', { email }),
  confirmPasswordReset: (data) => api.post('/auth/password-reset/confirm/', data),
};

export const staffService = {
  getAll: (params) => api.get('/auth/staff/', { params }),
  getOne: (id) => api.get(`/auth/staff/${id}/`),
  create: (data) => api.post('/auth/staff/', data),
  update: (id, data) => api.patch(`/auth/staff/${id}/`, data),
  toggleActive: (id) => api.post(`/auth/staff/${id}/toggle_active/`),
};

export const productService = {
  getAll: (params) => api.get('/products/', { params }),
  getOne: (id) => api.get(`/products/${id}/`),
  create: (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    return api.post('/products/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    return api.patch(`/products/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/products/${id}/`),
  getLowStock: () => api.get('/products/low_stock/'),
  getStats: () => api.get('/products/stats/'),
};

export const categoryService = {
  getAll: (params) => api.get('/products/categories/', { params }),
  create: (data) => api.post('/products/categories/', data),
  update: (id, data) => api.patch(`/products/categories/${id}/`, data),
  delete: (id) => api.delete(`/products/categories/${id}/`),
};

export const customerService = {
  getAll: (params) => api.get('/customers/', { params }),
  getOne: (id) => api.get(`/customers/${id}/`),
  create: (data) => api.post('/customers/', data),
  update: (id, data) => api.patch(`/customers/${id}/`, data),
  delete: (id) => api.delete(`/customers/${id}/`),
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchase_history/`),
};

export const salesService = {
  getAll: (params) => api.get('/sales/', { params }),
  getOne: (id) => api.get(`/sales/${id}/`),
  create: (data) => api.post('/sales/', data),
  getRecent: () => api.get('/sales/recent/'),
};

export const inventoryService = {
  getLogs: (params) => api.get('/inventory/logs/', { params }),
  restock: (data) => api.post('/inventory/restock/', data),
  adjust: (data) => api.post('/inventory/adjust/', data),
};

export const reportService = {
  getDashboard: () => api.get('/reports/dashboard/'),
  getSalesReport: (params) => api.get('/reports/sales/', { params }),
  getInventoryReport: () => api.get('/reports/inventory/'),
  getStaffReport: (params) => api.get('/reports/staff/', { params }),
  exportReport: (params) => api.get('/reports/export/', {
    params,
    responseType: 'blob',
  }),
};
