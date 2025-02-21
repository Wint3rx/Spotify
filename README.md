Spotify Top Tracks

Spotify Top Tracks es una aplicación web que permite a los usuarios conectar su cuenta de Spotify para visualizar y reproducir sus 10 canciones más escuchadas. La aplicación implementa dos tipos de colas para gestionar las canciones: una cola normal (FIFO) y una cola con prioridad basada en la popularidad de las pistas.

Características

- Autenticación segura con Spotify OAuth 2.0
- Visualización de las 10 canciones más escuchadas del usuario (rango medio)
- Dos sistemas de colas:
  - Cola normal (SongQueue): reproduce canciones en orden de llegada
  - Cola de prioridad (PrioritySongQueue): ordena por popularidad
- Interfaz de usuario inspirada en Spotify con controles de reproducción
- Diseño responsive y moderno con gradientes y efectos visuales

Requisitos

- Node.js (v14 o superior)
- Cuenta de desarrollador de Spotify para obtener CLIENT_ID y CLIENT_SECRET
- Navegador web moderno

Instalación

1. Clona el repositorio:
git clone https://github.com/tu-usuario/spotify-top-tracks.git
cd spotify-top-tracks

2. Instala las dependencias:
npm install

3. Configura las credenciales de Spotify:
   - Crea una aplicación en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
   - Copia tu `CLIENT_ID` y `CLIENT_SECRET`
   - Actualiza las constantes en `app.js`:
const CLIENT_ID = 'TU_CLIENT_ID';
const CLIENT_SECRET = 'TU_CLIENT_SECRET';

4. Inicia el servidor:
node app.js

5. Abre tu navegador en: `http://localhost:3001`

Uso

1. Conexión con Spotify:
   - Haz clic en "Conectar con Spotify" en la página principal
   - Autoriza la aplicación en la ventana de Spotify

2. Visualización:
   - Verás tus 10 canciones más escuchadas con detalles como título, artistas y popularidad

3. Reproducción:
   - Usa el botón "▶" para iniciar/pausar la reproducción
   - Cambia entre colas (Normal/Prioridad) con el botón "Cambiar Cola"
   - La canción actual se muestra en la sección "Reproduciendo"

Estructura del Proyecto

- `app.js`: Lógica principal del servidor y rutas
- `queue.js`: Implementación de las clases SongQueue y PrioritySongQueue
- `public/styles.css`: Estilos de la interfaz de usuario
- `public/`: Carpeta para archivos estáticos

Dependencias

- `express`: Framework web
- `axios`: Cliente HTTP
- `querystring`: Manejo de parámetros URL

Comentario sobre el manejo de Queues

La implementación actual utiliza dos enfoques distintos para el manejo de colas:
- `SongQueue` sigue un modelo FIFO simple, ideal para mantener el orden original
- `PrioritySongQueue` utiliza un sistema basado en popularidad, insertando elementos en orden descendente

Recomendación: Para aplicaciones de reproducción musical, la cola con prioridad podría ser más efectiva si se combina con factores adicionales como preferencias del usuario o recencia, en lugar de solo popularidad. Una implementación híbrida que permita pesos personalizados (por ejemplo, popularidad × factor de usuario) podría optimizar la experiencia.

---

Desarrollado con ❤️ por Winters_s
