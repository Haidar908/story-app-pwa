// src/scripts/pages/add-story/add-story-page.js
import { addStory } from '../../data/api';
import L from 'leaflet';

export default class AddStoryPage {
  async render() {
    return `
      <section class="container py-5">
        <div class="card p-4 shadow-lg mx-auto" style="max-width: 800px; width: 100%;">
          <h2 class="text-center mb-5">Bagikan Cerita Baru Anda</h2>
          
          <form id="add-story-form">
            
            <div class="form-group mb-4">
              <label for="photo" class="form-label font-weight-bold">1. Foto Cerita <span class="text-danger">*</span></label>
              <input type="file" id="photo" accept="image/*" class="form-control-file p-2 border rounded w-100" required>
              <small class="form-text text-muted">Unggah foto yang relevan dengan kisah Anda.</small>
            </div>

            <div class="form-group mb-4">
              <label for="description" class="form-label font-weight-bold">2. Deskripsi Cerita <span class="text-danger">*</span></label>
              <textarea id="description" rows="6" class="form-control" placeholder="Tuliskan kisah menarik di balik foto ini (minimal 10 karakter)..." required></textarea>
            </div>
            
            <div class="form-group border p-4 rounded bg-light mb-5">
              <label class="form-label font-weight-bold mb-3 d-block">3. Pilih Lokasi (Opsional: Klik pada Peta)</label>
              <div id="story-map-picker" style="height: 350px; width: 100%; border-radius: 8px; border: 1px solid #ccc;"></div>
              
              <p id="location-info" class="mt-3 text-muted">Lokasi: Belum dipilih</p>
              
              <input type="hidden" id="lat" name="lat">
              <input type="hidden" id="lon" name="lon">
            </div>

            <button type="submit" id="submit-button" class="btn btn-primary w-100 py-2">Unggah Cerita</button>
            <p id="message" class="mt-3 text-center"></p>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('add-story-form');
    const mapContainer = document.getElementById('story-map-picker');
    const latInput = document.getElementById('lat');
    const lonInput = document.getElementById('lon');
    const locationInfo = document.getElementById('location-info');
    const messageElement = document.getElementById('message');
    const submitButton = document.getElementById('submit-button');

    // 1. Inisialisasi Peta
    const map = L.map(mapContainer).setView([-2.5489, 118.0149], 5); 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker = null;

    // 2. Event Klik Peta untuk memilih koordinat (Kriteria 3)
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Hapus marker lama jika ada
      if (marker) {
        map.removeLayer(marker);
      }
      
      // Tambahkan marker baru
      marker = L.marker([lat, lng]).addTo(map);
      
      // Simpan nilai di hidden input
      latInput.value = lat;
      lonInput.value = lng;
      
      locationInfo.textContent = `Lokasi: Lat ${lat.toFixed(4)}, Lon ${lng.toFixed(4)}`;
    });

    // 3. Event Submit Formulir
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Kumpulkan data
      const description = document.getElementById('description').value;
      const photoFile = document.getElementById('photo').files[0];
      const lat = latInput.value;
      const lon = lonInput.value;

      messageElement.textContent = 'Mengunggah cerita...';
      submitButton.disabled = true;

      try {
        await addStory({ 
          description, 
          lat, 
          lon, 
          photo: photoFile 
        }); // Panggil fungsi API (Kriteria 3)
        
        // Kriteria 3 Skilled: Pesan sukses yang jelas
        messageElement.textContent = '✅ Cerita berhasil diunggah! Anda akan dialihkan ke Beranda.';
        form.reset(); 
        
        setTimeout(() => {
          window.location.hash = '/'; // Alihkan ke home setelah sukses
        }, 2000);

      } catch (error) {
        // Kriteria 3 Skilled: Pesan error yang jelas
        messageElement.textContent = `❌ Gagal mengunggah cerita: ${error.message}`;
        submitButton.disabled = false;
      }
    });
  }
}