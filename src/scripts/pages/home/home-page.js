// src/scripts/pages/home/home-page.js

import { getAllStories, isUserLoggedIn } from '../../data/api'; // <--- Import isUserLoggedIn
import L from 'leaflet';
import StoryDb from '../../data/story-db'; 

export default class HomePage {
  async render() {
    const isLoggedIn = isUserLoggedIn(); // Cek status login

    const infoBanner = isLoggedIn 
        ? ''
        : `<div class="alert alert-info p-3 mb-4 text-center">
             Anda sedang melihat tampilan tamu. Silakan <a href="#/login">Login</a> untuk menambahkan favorit dan cerita baru.
           </div>`;

    return `
      <section class="container py-5" id="main-content"> 
        ${infoBanner} <h2>Daftar Cerita</h2>

        <div class="filter-controls mb-4">
            <button id="filter-all" class="btn btn-primary active">Semua Cerita</button>
            <button id="filter-favorites" class="btn btn-outline-primary" ${!isLoggedIn ? 'disabled' : ''}>Daftar Favorit</button>
        </div>

        <div id="story-list-container" class="row">
          <div class="loader">Memuat cerita...</div>
        </div>

        <hr class="my-5">

        <h2>Peta Lokasi Cerita</h2>
        <div id="story-map" style="height: 500px; width: 100%;"></div>
      </section>
    `;
  }

  async afterRender() {
    this._allStoriesCache = []; 
    this._currentStories = []; 
    const isLoggedIn = isUserLoggedIn(); // Cek status login
    
    try {
      // Data cerita tetap diambil (publik)
      const stories = await getAllStories(); 
      this._allStoriesCache = stories;
      this._currentStories = stories;

      this._displayStoryList(this._currentStories, 'all', isLoggedIn);

      this._initMap(this._currentStories);
      
      // Setup Listener Filter (hanya jika login untuk mencegah error pada tombol)
      if (isLoggedIn) {
          this._setupFilterListeners();
      }

    } catch (error) {
      console.error('Gagal memuat data dari API. Mencoba IndexedDB...', error);
      
      // FALLBACK: Ambil dari IndexedDB (Offline Fallback)
      try {
        const cachedStories = await StoryDb.getAllStories();
        if (cachedStories.length) {
          alert('Anda sedang offline. Data yang ditampilkan adalah daftar favorit terakhir yang tersimpan.');
          this._allStoriesCache = cachedStories; 
          this._currentStories = cachedStories;
          
          this._displayStoryList(this._currentStories, 'favorites', isLoggedIn);
          this._initMap(this._currentStories);
          if (isLoggedIn) {
             this._setupFilterListeners();
          }
        } else {
          const container = document.getElementById('story-list-container');
          container.innerHTML = '<p class="error-message">Tidak dapat memuat cerita. Cek koneksi internet Anda atau silakan coba lagi.</p>';
        }
      } catch (dbError) {
        console.error('Gagal mengambil data dari IndexedDB:', dbError);
      }
    }
  }

  /**
   * Metode BARU: Setup Listener untuk tombol filter
   */
  _setupFilterListeners() {
    const filterAllBtn = document.getElementById('filter-all');
    const filterFavBtn = document.getElementById('filter-favorites');
    if (!filterFavBtn || filterFavBtn.disabled) return; // Hentikan jika tombol favorit dinonaktifkan

    const setActiveButton = (activeBtn, inactiveBtn) => {
        activeBtn.classList.add('btn-primary', 'active');
        activeBtn.classList.remove('btn-outline-primary');
        inactiveBtn.classList.remove('btn-primary', 'active');
        inactiveBtn.classList.add('btn-outline-primary');
    };

    filterAllBtn.addEventListener('click', () => {
        setActiveButton(filterAllBtn, filterFavBtn);
        this._currentStories = this._allStoriesCache;
        this._displayStoryList(this._currentStories, 'all', true); // Gunakan true karena tombol hanya aktif saat login
        this._initMap(this._currentStories);
    });

    filterFavBtn.addEventListener('click', async () => {
        setActiveButton(filterFavBtn, filterAllBtn);
        
        const favoriteStories = await StoryDb.getAllStories();
        this._currentStories = favoriteStories;
        
        this._displayStoryList(this._currentStories, 'favorites', true);
        this._initMap(this._currentStories); 
    });
  }

  /**
   * Menampilkan daftar cerita dan tombol favorit. 
   */
  _displayStoryList(stories, mode, isLoggedIn) {
    const container = document.getElementById('story-list-container');
    container.innerHTML = ''; 

    if (stories.length) {
      const storyPromises = stories.map(async story => {
        // Kriteria 4: Cek status favorit dari IndexedDB (hanya jika login)
        const isFavorited = isLoggedIn && (mode === 'favorites' || await StoryDb.getStory(story.id)); 
        const cardClass = 'story-card mb-4 p-3 shadow-sm border rounded'; 
        
        const favoriteButton = isLoggedIn 
            ? `
              <button 
                class="btn btn-sm ${isFavorited ? 'btn-danger' : 'btn-outline-danger'} mt-2 btn-favorite" 
                data-story-id="${story.id}"
                data-story-data='${JSON.stringify(story)}'
                data-is-favorited="${!!isFavorited}"
              >
                ${isFavorited ? '❤️ Hapus Favorit' : '🤍 Favoritkan'}
              </button>
            `
            : `<button class="btn btn-sm btn-outline-secondary mt-2" disabled>Login untuk Favoritkan</button>`;

        return `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="${cardClass}" style="width: 100%; height: 100%;">
                <img 
                  src="${story.photoUrl}" 
                  alt="Foto dari cerita oleh ${story.name}" 
                  class="img-fluid rounded mb-3"
                > 
                <div class="card-body">
                  <h4 class="mb-1">${story.name}</h4>
                  <p class="text-muted small">Tanggal: ${new Date(story.createdAt).toLocaleDateString()}</p>
                  <p>${story.description.substring(0, 150)}...</p>
                  ${favoriteButton}
                </div>
            </div>
          </div>
        `;
      });

      Promise.all(storyPromises).then(storyElements => {
        // Pasang di container
        container.innerHTML = storyElements.join(''); 
        // Setup listener hanya jika login, agar tombol disabled tidak memicu error
        if (isLoggedIn) {
            this._setupFavoriteButtonListeners();
        }
      });
      
    } else {
      container.innerHTML = mode === 'favorites' && isLoggedIn
        ? '<p>Anda belum memiliki cerita di daftar favorit.</p>'
        : '<p>Belum ada cerita yang dibagikan.</p>';
    }
  }

  /**
   * Memasang event listener pada semua tombol favorit (Logic C & D).
   * Metode ini HANYA dipanggil jika pengguna SUDAH login.
   */
  _setupFavoriteButtonListeners() {
    const buttons = document.querySelectorAll('.btn-favorite');
    buttons.forEach(button => {
      button.addEventListener('click', async (event) => {
        // ... (Logika C, D, dan perbarui tampilan tetap sama) ...
        const storyId = event.target.dataset.storyId;
        const storyData = JSON.parse(event.target.dataset.storyData);
        let isFavorited = event.target.dataset.isFavorited === 'true';
        
        try {
          if (isFavorited) {
            await StoryDb.deleteStory(storyId); 
            isFavorited = false;
            alert('Cerita dihapus dari favorit.');
          } else {
            await StoryDb.putStory(storyData); 
            isFavorited = true;
            alert('Cerita ditambahkan ke favorit.');
          }
        } catch (error) {
          console.error('Gagal memproses favorit:', error);
          alert('Operasi favorit gagal. Cek konsol untuk detail.');
        }

        event.target.dataset.isFavorited = isFavorited;
        event.target.innerHTML = isFavorited ? '❤️ Hapus Favorit' : '🤍 Favoritkan';
        
        if (isFavorited) {
            event.target.classList.remove('btn-outline-danger');
            event.target.classList.add('btn-danger');
        } else {
            event.target.classList.remove('btn-danger');
            event.target.classList.add('btn-outline-danger');
        }

        // Muat ulang daftar favorit jika sedang aktif
        if (document.getElementById('filter-favorites').classList.contains('active')) {
             const favoriteStories = await StoryDb.getAllStories();
             this._currentStories = favoriteStories;
             this._displayStoryList(this._currentStories, 'favorites', true);
             this._initMap(this._currentStories);
        }
      });
    });
  }

  // ... (Metode _initMap tetap sama)
  _initMap(stories) {
    const mapContainer = document.getElementById('story-map');
    
    if (mapContainer && mapContainer._leaflet_id) {
        mapContainer._leaflet_id = null;
    }

    const map = L.map(mapContainer).setView([-2.5489, 118.0149], 5); 

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    stories.forEach(story => {
      const lat = story.lat;
      const lon = story.lon;

      if (lat != null && lon != null) {
        L.marker([lat, lon])
          .addTo(map)
          .bindPopup(`
            <strong>${story.name}</strong><br>
            ${story.description.substring(0, 50)}...
          `);
      }
    });
  }
}