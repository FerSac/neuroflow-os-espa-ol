import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Manejador de errores global para depuración en modo offline
window.addEventListener('error', (event) => {
  console.error("Global error caught:", event.error);
  const loading = document.getElementById('loading-overlay');
  if (loading) {
    loading.innerHTML = `
      <div style="padding: 20px; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); max-width: 400px;">
        <h2 style="color: #ef4444; margin-top: 0;">Error de Sistema</h2>
        <p style="color: #3d3450;">No se pudo iniciar NeuroFlow OS.</p>
        <div style="background: #fdfbff; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 11px; text-align: left; overflow: auto; max-height: 100px;">
          ${event.message}<br>
          ${event.filename}:${event.lineno}
        </div>
        <button onclick="window.location.reload()" style="margin-top: 15px; padding: 8px 16px; background: #9b8ec4; color: white; border: none; border-radius: 6px; cursor: pointer;">Reiniciar</button>
      </div>
    `;
  }
});

const container = document.getElementById('root');
if (container) {
  try {
    const root = createRoot(container);
    root.render(<App />);
    
    // Ocultar el indicador de carga una vez iniciado React
    // Usamos un pequeño delay para asegurar la primera renderización
    requestAnimationFrame(() => {
      setTimeout(() => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          overlay.style.transition = 'opacity 0.5s ease-out';
          setTimeout(() => overlay.remove(), 500);
        }
      }, 100);
    });
  } catch (error) {
    console.error("Critical rendering error:", error);
    container.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; color: #3d3450; text-align: center;">
        <h2>NeuroFlow OS - Error Crítico</h2>
        <p>Hubo un problema al iniciar la aplicación.</p>
        <p style="font-size: 12px; color: #7a7089;">Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; cursor: pointer;">Reintentar</button>
      </div>
    `;
  }
}
