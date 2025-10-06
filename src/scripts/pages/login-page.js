// src/scripts/pages/login-page.js

import { loginUser } from '../data/api'; // Jalur API sudah dikoreksi: '../data/api'

export default class LoginPage {
  async render() {
    return `
      <section class="container d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div class="card p-4 shadow-lg" style="max-width: 400px; width: 100%;">
          <h2 id="login-title" class="text-center mb-4">Masuk ke Aplikasi</h2>
          <p class="text-center text-muted">Akses cerita dan fitur tambah cerita Anda.</p>
          
          <form id="auth-form" aria-labelledby="login-title">
            <div class="form-group">
              <label for="email">Alamat Email</label>
              <input type="email" id="email" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <input type="password" id="password" class="form-control" required>
            </div>
            
            <button type="submit" id="submit-button" class="btn btn-primary w-100 mt-3">Login</button>
            
            <p class="mt-3 text-center">Belum punya akun? <a href="#/register" id="register-link">Daftar di sini</a></p>
            <p id="auth-message" class="mt-3 text-center"></p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('auth-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageElement = document.getElementById('auth-message');
    const submitButton = document.getElementById('submit-button');
    
    // Logika submit form
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      messageElement.textContent = 'Memproses...';
      submitButton.disabled = true;

      try {
        await loginUser({ 
          email: emailInput.value, 
          password: passwordInput.value 
        });
        
        messageElement.textContent = '✅ Login Berhasil! Mengalihkan ke Beranda...';
        // Setelah token tersimpan, alihkan ke Home
        setTimeout(() => {
          window.location.hash = '/'; 
        }, 1000);

      } catch (error) {
        messageElement.textContent = `❌ Gagal Login: ${error.message}`;
        submitButton.disabled = false;
      }
    });
  }
}