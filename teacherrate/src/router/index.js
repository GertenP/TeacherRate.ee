import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/MainMenu.vue';
import LoginPage from '../components/LoginPage.vue';

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;