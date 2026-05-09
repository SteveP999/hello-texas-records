async function loadHomepage() {

  try {

    const response = await fetch('homepage-data.json?cb=' + Date.now());
    const data = await response.json();

    console.log('Homepage data loaded:', data);

    buildRoster(data.featuredArtists || []);

    loadRadio();

  } catch (err) {

    console.error('Failed to load homepage data:', err);

  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ROSTER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildRoster(artists) {

  const grid = document.getElementById('roster-grid');

  if (!grid) return;

  grid.innerHTML = '';

  artists.forEach(artist => {

    const card = document.createElement('div');
    card.className = 'artist-card';

    const images = buildArtistImageCandidates(artist);
    const firstImage = images[0] || 'https://raw.githubusercontent.com/SteveP999/hello-texas-records/main/htr-logo.png';

    const isLogoCard = /logo|monogram/i.test(firstImage);
    const fitClass = isLogoCard ? ' logo-card-img' : '';

    card.innerHTML = `
      <div class="card-art">
        <img
          src="${firstImage}"
          alt="${artist.name}"
          class="artist-card-img${fitClass}"
          data-img-index="0"
          data-img-candidates='${JSON.stringify(images)}'
          onerror="tryNextArtistImage(this)"
        >

        <div class="card-play-overlay">
          <button class="card-play-btn">
            ▶
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="card-genre">${artist.genre || ''}</div>

        <div class="card-artist">
          ${artist.name}
        </div>

        <div class="card-song">
          ${artist.latestTitle || artist.genre || ''}
        </div>

        <div class="card-links">
          <a
            href="${artist.siteUrl || '#'}"
            target="_blank"
            class="card-site-btn"
            onclick="event.stopPropagation()"
          >
            Visit Site
          </a>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {

      if (artist.siteUrl) {
        window.open(artist.siteUrl, '_blank');
      }

    });

    grid.appendChild(card);

  });
}

function buildArtistImageCandidates(artist) {
  const fallback = 'https://raw.githubusercontent.com/SteveP999/hello-texas-records/main/htr-logo.png';

  const resolve = (path) => {
    if (!path || !artist.githubRepo) return '';
    const value = String(path).trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
    const clean = value.replace(/^\.\//, '').replace(/^\//, '');
    return `https://raw.githubusercontent.com/${artist.githubRepo}/main/${clean}`;
  };

  const raw = [];

  if (Array.isArray(artist.imageCandidates)) raw.push(...artist.imageCandidates);
  raw.push(artist.heroImage, artist.logo);

  // Add generated fallbacks from the primary fields.
  [artist.heroImage, artist.logo].forEach(path => {
    if (!path) return;
    const clean = String(path).replace(/^\.\//, '').replace(/^\//, '');
    const file = clean.split('/').pop();

    if (file) {
      raw.push(file);
      raw.push(`images/artist/${file}`);
      raw.push(`images/logos/${file}`);
      raw.push(`images/covers/${file}`);
      raw.push(`covers/${file}`);
    }
  });

  const resolved = raw.map(resolve).filter(Boolean);

  resolved.push(fallback);

  return [...new Set(resolved)];
}

function tryNextArtistImage(img) {
  let list = [];

  try {
    list = JSON.parse(img.dataset.imgCandidates || '[]');
  } catch (e) {
    list = [];
  }

  const current = Number(img.dataset.imgIndex || 0);
  const next = current + 1;

  if (next < list.length) {
    img.dataset.imgIndex = String(next);
    img.src = list[next];
  } else {
    img.onerror = null;
    img.src = 'https://raw.githubusercontent.com/SteveP999/hello-texas-records/main/htr-logo.png';
    img.classList.add('logo-card-img');
  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RADIO LOADER
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function loadRadio() {

  try {

    const response = await fetch('radio-data.json?cb=' + Date.now());
    const songs = await response.json();

    console.log('Radio data loaded:', songs.length);

    buildRadio(songs);

  } catch (err) {

    console.error('Failed to load radio data:', err);

  }
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// RADIO
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let radioTracks = [];
let radioIndex = 0;
let radioShuffle = false;

const radioAudio = document.getElementById('radio-audio');
const radioArt = document.getElementById('radio-art');
const radioTitle = document.getElementById('radio-title');
const radioArtist = document.getElementById('radio-artist');
const radioPlayBtn = document.getElementById('radio-playbtn');

function buildRadio(songs) {

  radioTracks = songs.filter(song => song.audioFile);

  buildPlaylist();

  if (radioTracks.length > 0) {

    setRadioDisplay(radioTracks[0]);

  }
}

function buildPlaylist() {

  const list = document.getElementById('playlist-list');

  if (!list) return;

  list.innerHTML = radioTracks.map((track, index) => {

    return `
      <div class="pl-item" onclick="playTrack(${index})">

        <span class="pl-num">
          ${index + 1}
        </span>

        <img
          class="pl-thumb"
          src="${track.coverImage || ''}"
          alt="${track.title}"
        >

        <div class="pl-info">
          <div class="pl-title">
            ${track.title}
          </div>

          <div class="pl-artist">
            ${track.artist}
          </div>
        </div>
      </div>
    `;

  }).join('');
}

function playTrack(index) {

  const track = radioTracks[index];

  if (!track) return;

  radioIndex = index;

  radioAudio.src = track.audioFile;

  setRadioDisplay(track);

  radioAudio.play().catch(err => {
    console.error('Playback failed:', err);
  });

  radioPlayBtn.innerHTML = 'Pause';
  radioPlayBtn.classList.add('active');

  highlightTrack(index);
}

function setRadioDisplay(track) {

  radioTitle.textContent = track.title || 'Unknown Track';
  radioArtist.textContent = track.artist || 'Unknown Artist';

  if (track.coverImage) {
    radioArt.src = track.coverImage;
  }
}

function highlightTrack(index) {

  document.querySelectorAll('.pl-item').forEach((item, i) => {

    item.classList.toggle('active', i === index);

  });
}

function nextTrack() {

  if (radioTracks.length === 0) return;

  if (radioShuffle) {

    const random = Math.floor(Math.random() * radioTracks.length);
    playTrack(random);

  } else {

    const next = (radioIndex + 1) % radioTracks.length;
    playTrack(next);

  }
}

function previousTrack() {

  if (radioTracks.length === 0) return;

  const prev = (radioIndex - 1 + radioTracks.length) % radioTracks.length;

  playTrack(prev);
}

radioPlayBtn.addEventListener('click', () => {

  if (!radioAudio.src && radioTracks.length > 0) {

    playTrack(0);
    return;
  }

  if (radioAudio.paused) {

    radioAudio.play().catch(() => {});

    radioPlayBtn.innerHTML = 'Pause';
    radioPlayBtn.classList.add('active');

  } else {

    radioAudio.pause();

    radioPlayBtn.innerHTML = 'Play';
    radioPlayBtn.classList.remove('active');

  }
});

document.getElementById('radio-next').addEventListener('click', nextTrack);

document.getElementById('radio-prev').addEventListener('click', previousTrack);

document.getElementById('radio-shuffle').addEventListener('click', function () {

  radioShuffle = !radioShuffle;

  this.classList.toggle('active', radioShuffle);
});

document.getElementById('radio-vol').addEventListener('input', e => {

  radioAudio.volume = +e.target.value;
});

radioAudio.addEventListener('ended', nextTrack);

radioAudio.addEventListener('timeupdate', () => {

  const current = document.getElementById('radio-cur');
  const duration = document.getElementById('radio-dur');
  const fill = document.getElementById('radio-progress-fill');

  const cur = radioAudio.currentTime || 0;
  const dur = radioAudio.duration || 0;

  current.textContent = formatTime(cur);
  duration.textContent = formatTime(dur);

  if (dur > 0) {

    fill.style.width = `${(cur / dur) * 100}%`;
  }
});

function formatTime(seconds) {

  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  return `${mins}:${secs}`;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// START
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

loadHomepage();
