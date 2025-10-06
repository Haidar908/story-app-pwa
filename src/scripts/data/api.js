// src/scripts/data/api.js
import CONFIG from '../config';

const ENDPOINTS = {
  LIST_STORY: `${CONFIG.BASE_URL}/stories`, 
  ADD_STORY: `${CONFIG.BASE_URL}/stories`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
};

/**
 * Fungsi untuk mendapatkan token dari localStorage
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Fungsi untuk menyimpan token ke localStorage
 */
function saveAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/**
 * Fungsi untuk login
 */
export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Login gagal: ${errorBody.message || response.statusText}`);
  }

  const responseJson = await response.json();
  
  // Simpan token setelah login berhasil
  if (responseJson.loginResult && responseJson.loginResult.token) {
    saveAuthToken(responseJson.loginResult.token);
  }
  
  return responseJson;
}

/**
 * Fungsi untuk mengambil daftar semua cerita
 */
export async function getAllStories() {
  const token = getAuthToken();
  
  // Cek apakah token tersedia
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  const fetchResponse = await fetch(ENDPOINTS.LIST_STORY, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  // Error Handling
  if (!fetchResponse.ok) {
    if (fetchResponse.status === 401) {
      // Token expired atau invalid
      localStorage.removeItem('authToken');
      throw new Error('Sesi telah berakhir. Silakan login kembali.');
    }
    
    const errorBody = await fetchResponse.json();
    throw new Error(`Gagal mengambil cerita: ${errorBody.message || fetchResponse.statusText}`);
  }

  // Parse response
  const responseJson = await fetchResponse.json();
  return responseJson.listStory; 
}

/**
 * Fungsi untuk menambah cerita (dengan authentication)
 */
export async function addStory({ description, lat, lon, photo }) {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Token tidak ditemukan. Silakan login terlebih dahulu.');
  }

  const formData = new FormData();
  formData.append('description', description);
  if (lat && lon) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }
  if (photo) {
    formData.append('photo', photo);
  }

  const response = await fetch(ENDPOINTS.ADD_STORY, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      throw new Error('Sesi telah berakhir. Silakan login kembali.');
    }
    
    const errorBody = await response.json();
    throw new Error(`Gagal menambah cerita: ${errorBody.message || response.statusText}`);
  }

  const responseJson = await response.json();
  return responseJson;
}

/**
 * Fungsi untuk register user baru
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Registrasi gagal: ${errorBody.message || response.statusText}`);
  }

  const responseJson = await response.json();
  return responseJson;
}

/**
 * Fungsi untuk logout (menghapus token)
 */
export function logoutUser() {
  localStorage.removeItem('authToken');
}

/**
 * Fungsi untuk mengecek apakah user sudah login
 */
export function isUserLoggedIn() {
  return !!getAuthToken();
}