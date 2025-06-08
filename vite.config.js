import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/', // 👈 Esto asegura que las rutas sean relativas al dominio raíz
  plugins: [react()],
});
