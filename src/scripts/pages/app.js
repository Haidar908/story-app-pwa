import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupAppShell(); // Panggil listener SPA
  }

  _setupAppShell() {
    // 1. Mendengarkan event perubahan hash (navigasi)
    window.addEventListener('hashchange', () => {
      this.renderPage();
    });

    // 2. Memuat halaman pertama kali
    window.addEventListener('load', () => {
      this.renderPage();
    });
  }

  _setupDrawer() {
    // ... (Logika drawer Anda yang sudah ada)
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    // Logika View Transition (Kriteria 1 Basic: +2 pts)
    // **Tambahkan view-transition-name untuk elemen konten utama**
    this.#content.style.viewTransitionName = `page-${url.replace('/', '') || 'home'}`;

    const render = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    };

    if (document.startViewTransition) {
      document.startViewTransition(render);
    } else {
      render();
    }
  }
}

export default App;