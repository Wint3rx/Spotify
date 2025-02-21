// app.js
const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const { SongQueue, PrioritySongQueue } = require('./queue');

const app = express();
const port = 3001;

// Configuración de Spotify
const CLIENT_ID = 'YOUR-CLIENT-ID';
const CLIENT_SECRET = 'YOUR-CLIENT-SECRET';
const REDIRECT_URI = 'http://localhost:3001/callback';
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Crear instancias de las colas
const songQueue = new SongQueue();
const priorityQueue = new PrioritySongQueue();

// Ruta inicial
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Spotify Top Tracks</title>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <div class="header-gradient"></div>
      <div class="container">
        <div class="playlist-header">
          <div class="playlist-info">
            <div class="playlist-type">Bienvenido a</div>
            <h1 class="playlist-title">Spotify Top Tracks</h1>
            <div class="playlist-description">Conecta tu cuenta para ver tus canciones más escuchadas</div>
            <a href="/login" class="login-button">Conectar con Spotify</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ruta de login
app.get('/login', (req, res) => {
  const scope = 'user-top-read';
  const state = Math.random().toString(36).substring(7);

  const queryParams = querystring.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: scope,
    redirect_uri: REDIRECT_URI,
    state: state
  });
  
  res.redirect(`${SPOTIFY_AUTH_URL}?${queryParams}`);
});

// Ruta de callback
app.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(`Error de autorización: ${error}`);
  }

  if (!code) {
    return res.redirect('/');
  }

  try {
    const tokenResponse = await axios({
      method: 'post',
      url: SPOTIFY_TOKEN_URL,
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
      headers: {
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const access_token = tokenResponse.data.access_token;

    const topTracks = await axios.get(`${SPOTIFY_API_URL}/me/top/tracks`, {
      params: {
        limit: 10,
        time_range: 'medium_term'
      },
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    const tracks = topTracks.data.items.map((track, index) => ({
      id: track.id,
      number: index + 1,
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      duration: Math.floor(track.duration_ms / 1000),
      uri: track.uri,
      popularity: track.popularity,
      image: track.album.images[0]?.url
    }));

    // Limpiar y llenar las colas
    while (!songQueue.isEmpty()) songQueue.dequeue();
    while (!priorityQueue.isEmpty()) priorityQueue.dequeue();

    tracks.forEach(track => {
      songQueue.enqueue(track);
      priorityQueue.enqueue(track, track.popularity);
    });

    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Top Tracks - Spotify</title>
        <link rel="stylesheet" href="/styles.css">
        <script>
          let isPlaying = false;
          let currentQueue = 'normal';

          async function playNext() {
            const response = await fetch('/play-next', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ queue: currentQueue })
            });
            const data = await response.json();
            
            if (data.song) {
              document.getElementById('now-playing').textContent = 
                \`Reproduciendo: \${data.song.name} - \${data.song.artists}\`;
            } else {
              document.getElementById('now-playing').textContent = 'Cola vacía';
              isPlaying = false;
              document.querySelector('.play-button').textContent = '▶';
            }
          }

          function toggleQueue() {
            currentQueue = currentQueue === 'normal' ? 'priority' : 'normal';
            document.getElementById('queue-type').textContent = 
              \`Cola actual: \${currentQueue === 'normal' ? 'Normal' : 'Por popularidad'}\`;
          }

          function togglePlay() {
            isPlaying = !isPlaying;
            if (isPlaying) {
              playNext();
              document.querySelector('.play-button').textContent = '⏸';
            } else {
              document.querySelector('.play-button').textContent = '▶';
            }
          }
        </script>
      </head>
      <body>
        <div class="header-gradient"></div>
        <div class="container">
          <div class="playlist-header">
            <div class="playlist-image">
              <img src="${tracks[0].image || '/api/placeholder/232/232'}" alt="Top tracks cover">
            </div>
            <div class="playlist-info">
              <div class="playlist-type">Playlist</div>
              <h1 class="playlist-title">Tu Top 10</h1>
              <div class="playlist-description">Tus canciones más escuchadas en Spotify</div>
              <div class="playlist-metadata">
                <span>Spotify</span> • <span>10 canciones</span>
              </div>
            </div>
          </div>

          <div class="playlist-controls">
            <button class="play-button" onclick="togglePlay()">▶</button>
            <button class="queue-button" onclick="toggleQueue()">Cambiar Cola</button>
            <div id="queue-type">Cola actual: Normal</div>
            <div id="now-playing">Selecciona una canción para comenzar</div>
          </div>

          <div class="tracks-table-header">
            <div>#</div>
            <div>Título</div>
            <div>Popularidad</div>
          </div>

          <ul class="track-list">
            ${tracks.map(track => `
              <li class="track-item">
                <div class="track-number">${track.number}</div>
                <div class="track-info">
                  <div class="track-name">${track.name}</div>
                  <div class="track-artist">${track.artists}</div>
                </div>
                <div class="track-popularity">${track.popularity}%</div>
              </li>
            `).join('')}
          </ul>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.send(`
      <div class="container">
        <h1>Error</h1>
        <p>Hubo un error al procesar tu solicitud. Por favor, intenta nuevamente.</p>
        <a href="/" class="login-button">Volver al inicio</a>
      </div>
    `);
  }
});

// Ruta para reproducir siguiente canción
app.post('/play-next', (req, res) => {
  const { queue } = req.body;
  const currentQueue = queue === 'priority' ? priorityQueue : songQueue;
  
  const nextSong = currentQueue.dequeue();
  res.json({ song: nextSong });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});