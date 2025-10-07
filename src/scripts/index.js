// src/scripts/index.js

import 'regenerator-runtime'; 
import '../styles/styles.css';

import App from './pages/app'; 
import { isUserLoggedIn, logoutUser } from './data/api'; 
// Asumsi: Anda juga memiliki fungsi untuk subscribe push notification, jika tidak, hapus baris ini.
// import { subscribePushNotification } from './utils/push-notification-helper'; 

const app = new App({
  navigationDrawer: document.querySelector('.navigation-drawer'),
  drawerButton: document.querySelector('.drawer-button'),
  content: document.querySelector('main'),
});

// FUNGSI UNTUK MENGUPDATE NAVIGASI (Mendukung Guest View)
function updateNavigation() {
    const navList = document.querySelector('.nav-list');
    
    // 1. Kosongkan navigasi lama
    navList.innerHTML = '';
    
    // 2. Tautan Dasar (Selalu Ada)
    navList.innerHTML += '<li><a href="#/">Beranda</a></li>';
    navList.innerHTML += '<li><a href="#/about">About</a></li>';
    
    if (isUserLoggedIn()) {
        // KONDISI SUDAH LOGIN: Tambah Cerita & Logout
        navList.innerHTML += '<li><a href="#/add">Tambah Cerita</a></li>'; 
        navList.innerHTML += '<li><a id="logout-button" href="#">Logout</a></li>';
        
        // Opsional: Coba subscribe push notification segera setelah login
        // if (typeof subscribePushNotification === 'function') {
        //     subscribePushNotification(); 
        // }
    } else {
        // KONDISI BELUM LOGIN: Login & Register
        navList.innerHTML += '<li><a href="#/login">Login</a></li>';
        navList.innerHTML += '<li><a href="#/register">Register</a></li>'; 
    }

    // 3. Tambahkan Event Listener untuk Logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser(); 
            // Setelah logout, kembali ke beranda (guest view)
            window.location.hash = '/'; 
            updateNavigation(); // Update nav bar
            app.renderPage(); // Render ulang halaman (untuk menghilangkan konten favorit)
        });
    }
}

// PWA Kriteria 3: Mendaftarkan Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Pastikan service worker Anda berada di root (dist/sw.js)
    navigator.serviceWorker.register('./sw.js') 
      .then((registration) => {
        console.log('Service Worker registered successfully. Scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Event saat halaman dimuat
window.addEventListener('load', () => {
    app.renderPage();
    updateNavigation(); // Panggil saat load PERTAMA
});

// Event saat hash (URL) berubah
window.addEventListener('hashchange', () => {
    app.renderPage();
    updateNavigation(); // Panggil setiap navigasi berubah
});