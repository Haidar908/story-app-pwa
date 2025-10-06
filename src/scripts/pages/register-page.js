// src/scripts/pages/register-page.js

import { registerUser } from '../data/api'; // Jalur API sudah dikoreksi: '../data/api'

export default class RegisterPage {
  async render() {
    return `
      <section class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="card p-4 shadow-lg" style="max-width: 450px; width: 100%;">
          <h2 id="register-title" class="text-center mb-4">Buat Akun Baru</h2>
          
          <form id="register-form" aria-labelledby="register-title">
            <div class="form-group">
              <label for="name">Nama Lengkap</label>
              <input type="text" id="name" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="email">Alamat Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            
            <button type="submit" id="submit-button" class="btn btn-success w-100 mt-3">Daftar</button>
            
            <p class="mt-3 text-center">Sudah punya akun? <a href="#/login">Login di sini</a></p>
            <p id="auth-message" class="mt-3 text-center"></p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('auth-message');
    const submitButton = document.getElementById('submit-button');
    
    // Logika submit form
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      messageElement.textContent = 'Memproses pendaftaran...';
      submitButton.disabled = true;

      try {
        await registerUser({ 
          name: nameInput.value,
          email: emailInput.value, 
          password: passwordInput.value 
        });
        
        messageElement.textContent = '✅ Registrasi Berhasil! Silakan Login...';
        // Setelah berhasil daftar, alihkan ke halaman Login
        setTimeout(() => {
          window.location.hash = '/login'; 
        }, 1500);

      } catch (error) {
        messageElement.textContent = `❌ Gagal Registrasi: ${error.message}`;
        submitButton.disabled = false;
      }
    });
  }
}