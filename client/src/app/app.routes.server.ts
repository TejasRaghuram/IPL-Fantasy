import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'signup',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'rankings',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'create',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'join',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'error',
    renderMode: RenderMode.Prerender
  },
  {
    path: ':name',
    renderMode: RenderMode.Client
  },
  {
    path: ':league/:username',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];