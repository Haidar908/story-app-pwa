import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/login-page';
import RegisterPage from '../pages/register-page';
import AddStoryPage from '../pages/add-story/add-story-page'; // <-- BARU: Import komponen halaman tambah cerita

const routes = {
  '/': new HomePage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add': new AddStoryPage(), // <-- BARU: Daftarkan rute '/add'
};

export default routes;