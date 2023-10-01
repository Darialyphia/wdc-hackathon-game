import './styles/global.css';
import './utils/pixi-custom-elements';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router/auto';
import { createAuth0 } from '@auth0/auth0-vue';
import { createConvex } from './plugins/convex';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import App from './App.vue';
import gsap from 'gsap';

declare module 'vue-router/auto' {
  interface RouteMeta {
    needsAuth?: boolean;
    bg?: string;
  }
}

declare module 'vue-router' {
  interface RouteMeta {
    needsAuth?: boolean;
    bg?: string;
  }
}
gsap.install(window);
const app = createApp(App);

app.use(
  createRouter({
    history: createWebHistory()
  })
);
app.use(
  createAuth0({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENTID,
    useRefreshTokens: true,
    cacheLocation: 'localstorage',
    authorizationParams: {
      redirect_uri: window.location.origin
    }
  })
);
app.use(
  createConvex(import.meta.env.VITE_CONVEX_URL, {
    auth0: {
      installNavigationGuard: true,
      redirectTo: () => '/',
      needsAuth: to => !!to.meta.needsAuth
    }
  })
);
app.use(autoAnimatePlugin);
app.mount('#app');
