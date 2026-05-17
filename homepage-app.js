async function loadHomepage() {

  try {

    const response = await fetch('homepage-data.json?cb=' + Date.now());
    const data = await response.json();

    console.log('Homepage data loaded:', data);

    buildRoster(data.featuredArtists || []);

    // After cards render, re-scatter particles across full roster height
    setTimeout(() => {
      if (typeof window.particleScatter === 'function') window.particleScatter();
    }, 120);

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

    const image = buildArtistImage(artist);

    card.innerHTML = `
      <div class="card-art">
        <img
          src="${image}"
          alt="${artist.name}"
          onerror="
            if (!this.dataset.triedFlat) {
              this.dataset.triedFlat='1';
              this.src='Roster Photos/${artist.id}-roster-photo.png';
            } else {
              this.onerror=null;
              this.src='htr-logo.png';
            }
          "
        >

        <div class="card-play-overlay">
          <a class="card-play-btn" href="${artist.siteUrl || '#'}" target="_blank">
            Visit Site
          </a>
        </div>
      </div>

      <div class="card-body">
        <div class="card-genre">${artist.genre || ''}</div>

        <div class="card-artist">
          ${artist.name}
        </div>

        <div class="card-song">
          ${artist.genre || ''}
        </div>

        <div class="card-links">
          <a
            href="${artist.siteUrl || '#'}"
            target="_blank"
            class="card-site-btn"
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

function buildArtistImage(artist) {

  const fallback = 'htr-logo.png';

  if (!artist || !artist.id) return fallback;

  const artistId = String(artist.id).trim();

  // LOCKED ROSTER PHOTO RULE:
  // First try the current nested folder:
  //   Roster Photos/<artist-id>/<artist-id>-roster-photo.png
  // Then the image tag falls back to the older flat file:
  //   Roster Photos/<artist-id>-roster-photo.png
  return `Roster Photos/${artistId}/${artistId}-roster-photo.png`;
}


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
          src="${getRadioCover(track)}" onerror="this.onerror=null;this.src='htr-logo.png';"
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


function getRadioCover(track) {
  return (
    track.coverImage ||
    track.cover ||
    track.image ||
    track.albumCover ||
    track.albumArt ||
    'htr-logo.png'
  );
}

function setRadioImg(img, track) {
  if (!img) return;
  img.onerror = function () {
    this.onerror = null;
    this.src = 'htr-logo.png';
  };
  img.src = getRadioCover(track);
}

function setRadioDisplay(track) {

  if (!track) return;

  if (radioTitle) radioTitle.textContent = track.title || 'Unknown Track';
  if (radioArtist) radioArtist.textContent = track.artist || 'Unknown Artist';

  setRadioImg(radioArt, track);
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

const shuffleBtn = document.getElementById('radio-shuffle');
if (shuffleBtn) {
  shuffleBtn.addEventListener('click', function () {
    radioShuffle = !radioShuffle;
    this.classList.toggle('active', radioShuffle);
  });
}

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
