import { app } from './app.js';
import { config } from './config/index.js';

const server = app.listen(config.port, () => {
  console.log(`[BOT-CONTABLE] Servidor inicializado para ${config.empresa.nombre}`);
  console.log(`[BOT-CONTABLE] Escuchando peticiones en el puerto ${config.port} (${config.nodeEnv})`);
});

export default server;
