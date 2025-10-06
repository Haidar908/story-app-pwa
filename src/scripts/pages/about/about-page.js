// src/scripts/pages/about/about-page.js (Contoh)

export default class AboutPage {
  async render() {
    return `
      <section class="container py-5">
        <div class="text-center mb-5">
          <h1>Tentang Story App</h1>
          <p class="lead text-muted">Platform berbagi cerita dengan konteks lokasi visual.</p>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-4">
            <h3>Visi Kami</h3>
            <p>Kami percaya setiap foto memiliki kisah, dan setiap kisah terjadi di suatu tempat. Story App hadir sebagai wadah untuk menghubungkan momen visual Anda dengan lokasi geografisnya, menciptakan jurnal digital yang kaya konteks dan bermakna.</p>
          </div>
          
          <div class="col-md-6 mb-4">
            <h3>Teknologi di Balik Layar</h3>
            <ul class="list-unstyled">
              <li>• **Single Page Application (SPA):** Memberikan pengalaman navigasi yang cepat dan mulus tanpa *reload*.</li>
              <li>• **Geolocation Mapping (Leaflet):** Memungkinkan pengguna menandai lokasi cerita dengan akurat di peta interaktif.</li>
              <li>• **API RESTful:** Digunakan untuk otentikasi (Login/Register) dan pengelolaan data cerita.</li>
              <li>• **Webpack:** Digunakan untuk *bundling* aset dan pengelolaan *module*.</li>
            </ul>
          </div>
        </div>
        
        <div class="text-center mt-5">
          <p class="text-small text-muted">Aplikasi ini dibangun sebagai bagian dari Submission Proyek Akhir untuk kelas Front-End Web Developer Expert.</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Tidak ada logika yang dijalankan di About Page
  }
}