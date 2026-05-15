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

// ------------------------------------------------------------
// ROSTER
// ------------------------------------------------------------

function buildRoster(artists) {
  const grid = document.getElementById('roster-grid');
  if (!grid) return;

  grid.innerHTML = '';

  artists.forEach(artist => {
    const card = document.createElement('div');
    card.className = 'artist-card';

    const image = buildArtistImage(artist);

    card.innerHTML = `
      <div class="card-art">
        <img src="${image}" alt="${artist.name}">
        <div class="card-play-overlay">
          <button class="card-play-btn" type="button">▶</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-genre">${artist.genre || ''}</div>
        <div class="card-artist">${artist.name || ''}</div>
        <div class="card-song">${artist.genre || ''}</div>
        <div class="card-links">
          <a href="${artist.siteUrl || '#'}" target="_blank" class="card-site-btn">Visit Site</a>
        </div>
      </div>
    `;

    card.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      if (artist.siteUrl) window.open(artist.siteUrl, '_blank');
    });

    grid.appendChild(card);
  });
}

function buildArtistImage(artist) {
  if (artist.heroImage && artist.githubRepo) {
    return `https://raw.githubusercontent.com/${artist.githubRepo}/main/${artist.heroImage}`;
  }

  if (artist.logo && artist.githubRepo) {
    return `https://raw.githubusercontent.com/${artist.githubRepo}/main/${artist.logo}`;
  }

  return 'https://raw.githubusercontent.com/SteveP999/hello-texas-records/main/htr-logo.png';
}

// ------------------------------------------------------------
// HTR RECORDS HOMEPAGE RADIO
// This is the bottom/random homepage player only.
// This does NOT touch hellotexasradio.com / FM dial files.
// ------------------------------------------------------------

let radioTracks = [];
let radioIndex = 0;
let radioShuffle = false;

const HTR_LOGO = 'https://raw.githubusercontent.com/SteveP999/hello-texas-records/main/htr-logo.png';

const radioAudio = document.getElementById('radio-audio');
const radioArt = document.getElementById('radio-art');
const radioTitle = document.getElementById('radio-title');
const radioArtist = document.getElementById('radio-artist');
const radioAlbum = document.getElementById('radio-album');
const radioPlayBtn = document.getElementById('radio-playbtn');

const bottomBar = document.getElementById('radio-bottom-bar');
const bottomArt = document.getElementById('bottom-radio-art');
const bottomTitle = document.getElementById('bottom-radio-title');
const bottomArtist = document.getElementById('bottom-radio-artist');
const bottomAlbum = document.getElementById('bottom-radio-album');
const bottomPlayBtn = document.getElementById('radio-playbtn-bottom');

function $(id) {
  return document.getElementById(id);
}

function on(id, eventName, handler) {
  const el = $(id);
  if (el) el.addEventListener(eventName, handler);
}

function getTrackCover(track) {
  return (
    track?.coverImage ||
    track?.cover ||
    track?.albumCover ||
    track?.albumArt ||
    track?.image ||
    HTR_LOGO
  );
}

function getTrackAudio(track) {
  return track?.audioFile || track?.audioSrc || track?.audio || '';
}

function normalizeRadioTrack(track) {
  const audio = getTrackAudio(track);
  const cover = getTrackCover(track);

  return {
    ...track,
    audioFile: audio,
    audioSrc: track.audioSrc || audio,
    coverImage: cover,
    cover: track.cover || cover,
    albumCover: track.albumCover || track.albumArt || cover,
    albumArt: track.albumArt || track.albumCover || cover
  };
}

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

function buildRadio(songs) {
  radioTracks = (songs || [])
    .map(normalizeRadioTrack)
    .filter(song => song.audioFile);

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
      <div class="pl-item" data-radio-index="${index}">
        <span class="pl-num">${index + 1}</span>
        <img class="pl-thumb" src="${getTrackCover(track)}" alt="${track.title || ''}">
        <div class="pl-info">
          <div class="pl-title">${track.title || ''}</div>
          <div class="pl-artist">${track.artist || ''}</div>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-radio-index]').forEach(item => {
    item.addEventListener('click', () => playTrack(Number(item.dataset.radioIndex)));
  });
}

function setButtonState(isPlaying) {
  const label = isPlaying ? 'Pause' : 'Play';

  if (radioPlayBtn) {
    radioPlayBtn.textContent = label;
    radioPlayBtn.classList.toggle('active', isPlaying);
  }

  if (bottomPlayBtn) {
    bottomPlayBtn.textContent = label;
    bottomPlayBtn.classList.toggle('active', isPlaying);
  }

  document.body.classList.toggle('radio-playing', isPlaying);
  if (bottomBar) bottomBar.classList.toggle('visible', isPlaying);
}

function playTrack(index) {
  const track = radioTracks[index];
  if (!track || !radioAudio) return;

  radioIndex = index;
  radioAudio.src = track.audioFile;

  setRadioDisplay(track);

  radioAudio.play().then(() => {
    setButtonState(true);
  }).catch(err => {
    console.error('Playback failed:', err);
    setButtonState(false);
  });

  highlightTrack(index);
}

function setRadioDisplay(track) {
  const cover = getTrackCover(track);
  const title = track?.title || 'Unknown Track';
  const artist = track?.artist || 'Unknown Artist';
  const album = track?.album || 'Single';

  if (radioTitle) radioTitle.textContent = title;
  if (radioArtist) radioArtist.textContent = artist;
  if (radioAlbum) radioAlbum.textContent = `Album: ${album}`;
  if (radioArt) radioArt.src = cover;

  if (bottomTitle) bottomTitle.textContent = title;
  if (bottomArtist) bottomArtist.textContent = artist;
  if (bottomAlbum) bottomAlbum.textContent = `Album: ${album}`;
  if (bottomArt) bottomArt.src = cover;
}

function highlightTrack(index) {
  document.querySelectorAll('.pl-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
}

function nextTrack() {
  if (radioTracks.length === 0) return;

  if (radioShuffle) {
    playTrack(Math.floor(Math.random() * radioTracks.length));
    return;
  }

  playTrack((radioIndex + 1) % radioTracks.length);
}

function previousTrack() {
  if (radioTracks.length === 0) return;
  playTrack((radioIndex - 1 + radioTracks.length) % radioTracks.length);
}

function toggleRadioPlayback() {
  if (!radioAudio) return;

  if (!radioAudio.src && radioTracks.length > 0) {
    playTrack(0);
    return;
  }

  if (radioAudio.paused) {
    radioAudio.play().then(() => {
      setButtonState(true);
    }).catch(() => {
      setButtonState(false);
    });
  } else {
    radioAudio.pause();
    setButtonState(false);
  }
}

function updateProgress() {
  if (!radioAudio) return;

  const current = document.getElementById('radio-cur');
  const duration = document.getElementById('radio-dur');
  const fill = document.getElementById('radio-progress-fill');

  const cur = radioAudio.currentTime || 0;
  const dur = radioAudio.duration || 0;

  if (current) current.textContent = formatTime(cur);
  if (duration) duration.textContent = formatTime(dur);

  if (fill && dur > 0) fill.style.width = `${(cur / dur) * 100}%`;
}

function seekFromClick(event) {
  if (!radioAudio) return;

  const wrap = event.currentTarget;
  const rect = wrap.getBoundingClientRect();
  const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
  const dur = radioAudio.duration || 0;

  if (dur > 0) radioAudio.currentTime = ratio * dur;
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');

  return `${mins}:${secs}`;
}

// Controls
if (radioPlayBtn) radioPlayBtn.addEventListener('click', toggleRadioPlayback);
if (bottomPlayBtn) bottomPlayBtn.addEventListener('click', toggleRadioPlayback);

on('radio-next', 'click', nextTrack);
on('radio-prev', 'click', previousTrack);
on('radio-next-bottom', 'click', nextTrack);
on('radio-prev-bottom', 'click', previousTrack);

on('radio-shuffle', 'click', function () {
  radioShuffle = !radioShuffle;
  this.classList.toggle('active', radioShuffle);
});

document.querySelectorAll('#radio-vol').forEach(input => {
  input.addEventListener('input', e => {
    if (radioAudio) radioAudio.volume = +e.target.value;
  });
});

document.querySelectorAll('#radio-progress-wrap').forEach(wrap => {
  wrap.addEventListener('click', seekFromClick);
});

if (radioAudio) {
  radioAudio.addEventListener('ended', nextTrack);
  radioAudio.addEventListener('timeupdate', updateProgress);
  radioAudio.addEventListener('pause', () => setButtonState(false));
  radioAudio.addEventListener('play', () => setButtonState(true));
}

loadHomepage();
