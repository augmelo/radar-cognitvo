/**
 * Radar Cognitivo - Servidor de Desenvolvimento e Hospedagem Estática
 * 
 * Executa o Vite na porta 3000 para o ambiente AI Studio e suporte local.
 * Toda a dinâmica de salas de aula ao vivo é executada 100% via P2P WebRTC
 * diretamente entre os navegadores do professor e dos estudantes,
 * garantindo custo zero e compatibilidade direta com GitHub Pages.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Verificação de saúde da aplicação
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    architecture: 'p2p-webrtc',
    serverless: true
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Radar Cognitivo] Executando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
