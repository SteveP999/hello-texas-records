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
    const firstImage = images[0] || 'htr-logo.png';

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
  const fallback = 'htr-logo.png';

  const resolve = (path) => {
    if (!path) return '';
    const value = String(path).trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;

    const clean = value.replace(/^\.\//, '').replace(/^\//, '');

    // Roster photos live in THIS hello-texas-records repo.
    if (clean.startsWith('Roster Photos/') && clean.endsWith('-roster-photo.png')) {
      return clean;
    }

    // Homepage-owned fallback assets stay local.
    if (clean.startsWith('images/logos/') || clean === 'htr-logo.png') {
      return clean;
    }

    // Older artist-repo images remain a fallback only.
    if (artist.githubRepo) {
      return `https://raw.githubusercontent.com/${artist.githubRepo}/main/${clean}`;
    }

    return fallback;
  };

  const raw = [];

  if (Array.isArray(artist.imageCandidates)) raw.push(...artist.imageCandidates);
  raw.push(artist.heroImage, artist.logo, 'htr-logo.png');

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
    img.src = 'htr-logo.png';
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
let radioShuffle = true;

const radioAudio = document.getElementById('radio-audio');
const radioArt = document.getElementById('radio-art');
const radioTitle = document.getElementById('radio-title');
const radioArtist = document.getElementById('radio-artist');
const radioAlbum = document.getElementById('radio-album');
const radioPlayBtn = document.getElementById('radio-playbtn');
const radioPlayBtnBottom = document.getElementById('radio-playbtn-bottom');
const radioPrevBottom = document.getElementById('radio-prev-bottom');
const radioNextBottom = document.getElementById('radio-next-bottom');
const radioBottomBar = document.getElementById('radio-bottom-bar');
const bottomRadioArt = document.getElementById('bottom-radio-art');
const bottomRadioTitle = document.getElementById('bottom-radio-title');
const bottomRadioArtist = document.getElementById('bottom-radio-artist');
const bottomRadioAlbum = document.getElementById('bottom-radio-album');

function shouldIncludeMainRadioTrack(song) {
  const artist = String(song.artist || '').toLowerCase();
  const artistId = String(song.artistId || '').toLowerCase();
  const title = String(song.title || '').toLowerCase();
  const album = String(song.album || '').toLowerCase();

  // Remove Lucas Harlow instrumentals from main HTR homepage radio.
  if (artist.includes('lucas harlow') || artistId === 'lucas-harlow') return false;

  // Remove legacy Neon Thunder replacements.
  if (artist.includes('neon thunder') || artistId === 'neon-thunder') return false;
  if (title === 'neon hearts') return false;
  if (title === 'the storm never sleeps' && (artist.includes('neon thunder') || artistId === 'neon-thunder')) return false;

  // Remove Hello Texas profane TeXXXas Tales album from the main site radio.
  if ((artist.includes('hello texas') || artistId === 'hello-texas') && album === 'texxxas tales') return false;

  return Boolean(song.audioFile || song.audioSrc || song.audio);
}



function showBottomRadioBar() {
  if (radioBottomBar) radioBottomBar.classList.add('visible');
  document.body.classList.add('radio-playing');
}

function hideBottomRadioBar() {
  if (radioBottomBar) radioBottomBar.classList.remove('visible');
  document.body.classList.remove('radio-playing');
}

function syncBottomRadioDisplay(track) {
  if (!track) return;

  if (bottomRadioTitle) bottomRadioTitle.textContent = track.title || 'Unknown Track';
  if (bottomRadioArtist) bottomRadioArtist.textContent = track.artist || 'Unknown Artist';
  if (bottomRadioAlbum) bottomRadioAlbum.textContent = `Album: ${track.album || '—'}`;

  if (bottomRadioArt) {
    bottomRadioArt.onerror = function () {
      this.onerror = null;
      this.src = 'htr-logo.png';
    };
    bottomRadioArt.src = resolveRadioImage(track);
  }
}

function setRadioPlayButtonState(isPlaying) {
  const label = isPlaying ? 'Pause' : '▶ Play';
  if (radioPlayBtn) {
    radioPlayBtn.innerHTML = label;
    radioPlayBtn.classList.toggle('active', isPlaying);
  }
  if (radioPlayBtnBottom) {
    radioPlayBtnBottom.innerHTML = label;
    radioPlayBtnBottom.classList.toggle('active', isPlaying);
  }
}

function buildRadio(songs) {

  radioTracks = songs.filter(shouldIncludeMainRadioTrack);

  buildPlaylist();

  if (radioTracks.length > 0) {
    radioIndex = Math.floor(Math.random() * radioTracks.length);
    setRadioDisplay(radioTracks[radioIndex]);
  }
}

function buildPlaylist() {
  return;
}

function playTrack(index) {

  const track = radioTracks[index];

  if (!track) return;

  radioIndex = index;

  radioAudio.src = track.audioFile || track.audioSrc || track.audio;

  setRadioDisplay(track);
  syncBottomRadioDisplay(track);
  showBottomRadioBar();

  radioAudio.play().catch(err => {
    console.error('Playback failed:', err);
  });

  setRadioPlayButtonState(true);

  highlightTrack(index);
}

function resolveRadioImage(track) {
  const fallback = 'htr-logo.png';

  const artistRepoMap = {
    'avery-ivey':'SteveP999/Avery-Ivey',
    'ivey-wilder':'SteveP999/Ivey-Wilder',
    'daniel-kincaid':'SteveP999/Daniel-Kincaid',
    'hello-texas':'SteveP999/Hello-Texas',
    'lucas-harlow':'SteveP999/Lucas-Harlow',
    'night-shift':'SteveP999/Night-Shift',
    'nightstrike':'SteveP999/NightStrike',
    'night-strike':'SteveP999/NightStrike',
    'parsons-cross':'SteveP999/Parsons-Cross',
    'pulse7':'SteveP999/PULSE7',
    'pulse-7':'SteveP999/PULSE7',
    'rio-valencia':'SteveP999/Rio-Valencia',
    'sawyer-price':'SteveP999/Sawyer-Price',
    'silent-oblivion':'SteveP999/Silent-Oblivion',
    'skyline-theory':'SteveP999/Skyline-Theory',
    'stephen-parsons':'SteveP999/stephen-parsons',
    'taylor-martin':'SteveP999/Taylor-Martin',
    'vanta':'SteveP999/vanta',
    'vincent-cole':'SteveP999/Vincent-Cole',
    'borrowed-whispers':'SteveP999/Borrowed-Whispers',
    'brightons':'SteveP999/Brightons'
  };

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replaceAll('&', 'and')
      .replaceAll("'", '')
      .replaceAll('’', '')
      .replaceAll('‘', '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  let artistId = track.artistId || String(track.artist || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const repo = artistRepoMap[artistId];
  if (!repo) return fallback;

  let raw = String(track.coverImage || track.cover || track.image || '').trim().replace(/\\/g, '/');

  // Old drift artifact. Do not use this folder. Radio covers live in artist repo images/covers.
  if (!raw || raw.startsWith('Radio Covers/')) {
    raw = `images/covers/${artistId}-${slugify(track.title)}-cover.png`;
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  const clean = raw.replace(/^\.\//, '').replace(/^\//, '');

  // LOCKED: all song covers live here:
  // <artist-repo>/images/covers/<artist-id>-<song-slug>-cover.png
  if (clean.startsWith('images/covers/')) {
    return `https://raw.githubusercontent.com/${repo}/main/${clean}`;
  }

  // Safety bridge for older data only. The generator should not output this anymore.
  if (clean.startsWith('covers/')) {
    return `https://raw.githubusercontent.com/${repo}/main/images/${clean}`;
  }

  return `https://raw.githubusercontent.com/${repo}/main/images/covers/${clean}`;
}

function setRadioDisplay(track) {

  radioTitle.textContent = track.title || 'Unknown Track';
  radioArtist.textContent = track.artist || 'Unknown Artist';

  if (radioAlbum) {
    radioAlbum.textContent = `Album: ${track.album || '—'}`;
  }

  radioArt.onerror = function () {
    this.onerror = null;
    this.src = 'htr-logo.png';
  };

  radioArt.src = resolveRadioImage(track);
  syncBottomRadioDisplay(track);
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


function toggleRadioPlayback() {

  if (!radioAudio.src && radioTracks.length > 0) {

    playTrack(Math.floor(Math.random() * radioTracks.length));
    return;
  }

  if (radioAudio.paused) {

    radioAudio.play().catch(() => {});

    setRadioPlayButtonState(true);
    showBottomRadioBar();

  } else {

    radioAudio.pause();

    setRadioPlayButtonState(false);
    hideBottomRadioBar();

  }
}

radioPlayBtn.addEventListener('click', toggleRadioPlayback);

if (radioPlayBtnBottom) {
  radioPlayBtnBottom.addEventListener('click', toggleRadioPlayback);
}

if (radioPrevBottom) {
  radioPrevBottom.addEventListener('click', previousTrack);
}

if (radioNextBottom) {
  radioNextBottom.addEventListener('click', nextTrack);
}


document.getElementById('radio-next').addEventListener('click', nextTrack);

document.getElementById('radio-prev').addEventListener('click', previousTrack);


document.getElementById('radio-progress-wrap').addEventListener('click', e => {
  if (!radioAudio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  radioAudio.currentTime = ((e.clientX - r.left) / r.width) * radioAudio.duration;
});

document.getElementById('radio-vol').addEventListener('input', e => {

  radioAudio.volume = +e.target.value;
});

radioAudio.addEventListener('ended', nextTrack);

radioAudio.addEventListener('pause', () => {
  if (!radioAudio.ended) {
    setRadioPlayButtonState(false);
    hideBottomRadioBar();
  }
});

radioAudio.addEventListener('play', () => {
  setRadioPlayButtonState(true);
  showBottomRadioBar();
});

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
