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
          <a class="card-play-btn" href="${artist.siteUrl || '#'}" target="_blank" onclick="event.stopPropagation()">
            Visit Site
          </a>
        </div>
      </div>

      <div class="card-body">
        <div class="card-genre">${artist.genre || ''}</div>

        <div class="card-artist">
          ${artist.id === 'avery-ivey' ? '<a href="https://stevep999.github.io/Wildflower-Movie/" target="_blank" class="card-easter-egg" title="Wildflower - The Movie">&#127902;</a> ' : ''}${artist.name}${artist.id === 'avery-ivey' ? ' <a href="https://stevep999.github.io/Wildflower-Series/" target="_blank" class="card-easter-egg" title="Wildflower - The Series">&#128250;</a>' : ''}${artist.id === 'hello-texas' ? ' <a href="https://stevep999.github.io/sdb-style-game/" target="_blank" class="card-easter-egg" title="Same Damn Song">&#9834;</a>' : ''}
        </div>

        <div class="card-song">
          ${artist.genre || ''}
        </div>

        <div class="card-links">
          <a href="${artist.siteUrl || '#'}" target="_blank" class="card-site-btn">Visit Site</a>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      // Don't navigate if clicking an easter egg or any link inside the card
      if (e.target.closest('a')) return;
      if (artist.siteUrl) window.open(artist.siteUrl, '_blank');
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
let radioQueue  = [];   // shuffled playback order (indices into radioTracks)
let radioQueuePos = -1; // current position in queue
let radioHistory = []; // track indices already played, for back navigation
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
    shuffleQueue();
    setRadioDisplay(radioTracks[radioQueue[0]]);
  }
}

function shuffleQueue() {
  // Fisher-Yates shuffle of track indices
  const indices = radioTracks.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  radioQueue = indices;
  radioQueuePos = -1;
  radioHistory = [];
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

function playTrack(trackIndex, addToHistory = true) {
  const track = radioTracks[trackIndex];
  if (!track) return;

  // Save current to history before moving away
  if (addToHistory && radioQueuePos >= 0) {
    radioHistory.push(radioQueue[radioQueuePos]);
  }

  // Update queue position to match this track
  const qPos = radioQueue.indexOf(trackIndex);
  if (qPos >= 0) radioQueuePos = qPos;

  radioAudio.src = track.audioFile;
  setRadioDisplay(track);
  updateBottomBar(track);
  highlightTrack(trackIndex);

  radioAudio.play().catch(err => console.error('Playback failed:', err));
  radioPlayBtn.innerHTML = 'Pause';
  radioPlayBtn.classList.add('active');

  const bar = document.getElementById('radio-bottom-bar');
  if (bar) bar.classList.add('visible');
  document.body.classList.add('radio-playing');
}

function playNextInQueue() {
  // Save current position to history before advancing
  if (radioQueuePos >= 0) radioHistory.push(radioQueue[radioQueuePos]);
  radioQueuePos++;
  if (radioQueuePos >= radioQueue.length) {
    shuffleQueue();
    radioQueuePos = 0;
  }
  playTrack(radioQueue[radioQueuePos], false);
}

function playPrevInQueue() {
  if (radioHistory.length > 0) {
    const prevTrackIndex = radioHistory.pop();
    const qPos = radioQueue.indexOf(prevTrackIndex);
    radioQueuePos = qPos >= 0 ? qPos : Math.max(0, radioQueuePos - 1);
    playTrack(radioQueue[radioQueuePos], false);
  }
}


function updateBottomBar(track) {
  const title  = document.getElementById('bottom-radio-title');
  const artist = document.getElementById('bottom-radio-artist');
  const album  = document.getElementById('bottom-radio-album');
  const art    = document.getElementById('bottom-radio-art');
  if (title)  title.textContent  = track.title  || '—';
  if (artist) artist.textContent = track.artist || 'HTR Radio';
  if (album)  album.textContent  = track.album  || '';
  if (art)    { art.onerror = () => { art.src = 'htr-logo.png'; }; art.src = getRadioCover(track); }
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
  if (radioTitle)  radioTitle.textContent  = track.title  || 'Unknown Track';
  if (radioArtist) radioArtist.textContent = track.artist || 'Unknown Artist';
  const albumEl = document.getElementById('radio-album');
  if (albumEl) albumEl.textContent = track.album ? `Album: ${track.album}` : '';
  setRadioImg(radioArt, track);
}

function highlightTrack(index) {

  document.querySelectorAll('.pl-item').forEach((item, i) => {

    item.classList.toggle('active', i === index);

  });
}

function nextTrack() { playNextInQueue(); }
function previousTrack() { playPrevInQueue(); }

radioPlayBtn.addEventListener('click', () => {
  if (!radioAudio.src || radioAudio.src === window.location.href) {
    playNextInQueue();
    return;
  }
  if (radioAudio.paused) {
    radioAudio.play().catch(() => {});
    radioPlayBtn.innerHTML = 'Pause';
    radioPlayBtn.classList.add('active');
    const bar = document.getElementById('radio-bottom-bar');
    if (bar) bar.classList.add('visible');
    document.body.classList.add('radio-playing');
  } else {
    radioAudio.pause();
    radioPlayBtn.innerHTML = '&#9654; Play';
    radioPlayBtn.classList.remove('active');
  }
});

// Progress bar seek — both main player and bottom bar
function seekFromClick(e, wrap) {
  if (!radioAudio.duration) return;
  const rect = wrap.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  radioAudio.currentTime = pct * radioAudio.duration;
}

const progressWrap = document.getElementById('radio-progress-wrap');
if (progressWrap) {
  progressWrap.addEventListener('click', e => seekFromClick(e, progressWrap));
}

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

radioAudio.addEventListener('ended', playNextInQueue);

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

// Bottom bar controls
const barPrev = document.getElementById('radio-prev-bottom');
const barPlay = document.getElementById('radio-playbtn-bottom');
const barNext = document.getElementById('radio-next-bottom');
if (barPrev) barPrev.addEventListener('click', previousTrack);
if (barNext) barNext.addEventListener('click', nextTrack);
if (barPlay) barPlay.addEventListener('click', () => {
  if (radioAudio.paused) {
    radioAudio.play().catch(() => {});
    barPlay.innerHTML = '&#9646;&#9646; Pause';
  } else {
    radioAudio.pause();
    barPlay.innerHTML = '&#9654; Play';
  }
});
