//////////////////////////////////////////////// YOUTUBE API ////////////////////////////////////////////////////////////
// global variable for the player
let player;

// this function gets called when API is ready to use
function onYouTubePlayerAPIReady() {
  // create the global player from the specific iframe (#video)
  player = new YT.Player('video', {
    events: {
      onReady: onPlayerReady,
    },
  });
}
function onPlayerReady() {
  player.setPlaybackQuality('hd720'); // <-- WORKS!
}
// Inject YouTube API script
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//////////////////////////////////////////////// END YOUTUBE API ////////////////////////////////////////////////////////////

const songContainer = document.querySelector('.song-container');
const playPauseBtnPlayer = document.querySelector(
  '.player-container i#play-pause'
);
const backwardBtn = document.querySelector('#backward');
const forwardBtn = document.querySelector('#forward');

// genius api
const accessToken =
  '?access_token=CXyFeSBw2lAdG41xkuU3LS6a_nwyxwwCz2dCkUohw-rw0C49x2HqP__6_4is5RPx';
const APISearch = 'https://api.genius.com/search';
const APISong = 'https://api.genius.com/songs/';
// const songIDArray = ['2471960'];
const songIDArray = ['521662', '2471960', '3315890', '3359190', '725791'];

// all necessary data about songs
const songs = {
  allSongs: [],
  currentSongEl: '',
  currentSongJSON: '',
};

const searchSongById = async function (id) {
  try {
    if (!id) return;

    const res = await fetch(`${APISong}${id}${accessToken}`);
    const data = await res.json();

    songs.allSongs.push(data.response.song);
    displaySong(data.response.song);
  } catch (error) {
    console.log(error);
  }
};

const searchSongByName = async function (input) {
  try {
    const inputValue = `&q=${input.value}`;
    const res = await fetch(`${APISearch}${accessToken}&${inputValue}`);
    const data = await res.json();
    const songsOnly = data.response.hits.filter(data => data.type === 'song');

    if (!songsOnly) return;
    songContainer.innerHTML = '';

    songsOnly.forEach(data => searchSongById(data.result.id));
  } catch (error) {
    console.log(error);
  }
};

const playPauseFunctionality = function () {
  if (playPauseBtnPlayer.className.includes('play')) {
    player.playVideo();
    playPauseIconSwitch('play', 'pause');
    return;
  }

  if (playPauseBtnPlayer.className.includes('pause')) {
    player.pauseVideo();
    playPauseIconSwitch('pause', 'play');
    return;
  }
};

const nextSong = function () {
  if (!songs.currentSongEl) return;
  console.log(songs.currentSongEl);
  const currentSongIndex = songs.allSongs.findIndex(
    song => song.id == songs.currentSongEl.id
  );

  if (currentSongIndex === songs.allSongs.length - 1) {
    songs.currentSongJSON = songs.allSongs[0];
    songs.currentSongEl = songContainer.firstElementChild;
    playClickedSong(songs.allSongs[0]);
    return;
  }

  songs.currentSongJSON = songs.allSongs[currentSongIndex + 1];
  songs.currentSongEl = document.getElementById(songs.currentSongJSON.id);
  playClickedSong(songs.allSongs[currentSongIndex + 1]);
};

const prevSong = function () {
  if (!songs.currentSongEl) return;

  const currentSongIndex = songs.allSongs.findIndex(
    song => song.id == songs.currentSongEl.id
  );

  if (currentSongIndex === 0) {
    songs.currentSongJSON = songs.allSongs[songs.allSongs.length - 1];
    songs.currentSongEl = songContainer.lastElementChild;
    playClickedSong(songs.allSongs[songs.allSongs.length - 1]);
    return;
  }

  songs.currentSongJSON = songs.allSongs[currentSongIndex - 1];
  songs.currentSongEl = document.getElementById(songs.currentSongJSON.id);
  playClickedSong(songs.allSongs[currentSongIndex - 1]);
};

const playerControlsHandler = function () {
  forwardBtn.addEventListener('click', nextSong);
  backwardBtn.addEventListener('click', prevSong);
  playPauseBtnPlayer.addEventListener('click', playPauseFunctionality);
};

// executed on page load
songIDArray.forEach(id => {
  searchSongById(id);
  playerControlsHandler();
});

const displaySong = function (song) {
  console.log(song);
  const artist = song.primary_artist.name;
  const songName = song.title;
  const html = `
    <div class="song" id=${song.id}>
    <div class="song-details">
      <img
        src=${song.song_art_image_url}
        alt=""
      />
      <i class="fas fa-play play" id="play-pause"></i>
      <h4>${artist} - ${songName}</h4>
      <p class="lyrics-btn">Lyrics</p>
    </div>
    <div class="social">
      ${displaySocialMedia(song.media)}
    </div>
  </div>
    `;
  songContainer.insertAdjacentHTML('beforeend', html);

  songs.currentSongEl = songContainer.firstElementChild;
  songs.currentSongJSON = songs.allSongs[0];
  playClickedSong(songs.allSongs[0]);
};

const displaySocialMedia = function (media) {
  if (!media) return;
  let html = '';
  media.forEach(
    social =>
      (html += `<a href=${social.url}><i class="fab fa-${social.provider} ${social.provider} fa-lg"></i></a>`)
  );

  return html || 'We couldn\t find your song';
};

const playClickedSong = async function (song) {
  // search for youtube url of song
  if (!song.media) return;

  const youtubeUrl = song.media.find(player => player.provider === 'youtube')
    .url;
  if (!youtubeUrl) return;

  const youtubeUrlCode = youtubeUrl.slice(youtubeUrl.indexOf('?v=') + 3);
  const iframe = document.querySelector('iframe');
  iframe.src = `https://www.youtube.com/embed/${youtubeUrlCode}?autoplay=1&autopause=0&version=3&enablejsapi=1&playerapiid=ytplayer`;

  updatePlayer(song);
};

const updatePlayer = function (song) {
  const playerContainer = document.querySelector('.player-container');
  const artist = playerContainer.querySelector('.author');
  const songName = playerContainer.querySelector('.song-name');
  const songArtImage = playerContainer.querySelector('.art-image');

  songName.textContent = song.title;
  artist.textContent = song.primary_artist.name;
  songArtImage.src = song.song_art_image_url;

  // changing play btn to pause btn
  playPauseIconSwitch('play', 'pause');
};

const playPauseIconSwitch = function (from, to) {
  // switch all btns to play btn
  const searchPlayPause = songContainer.querySelectorAll('i#play-pause');
  searchPlayPause.forEach(
    btn => (btn.className = btn.className.replaceAll('pause', 'play'))
  );

  if (!songs.currentSongEl) return;

  const currentSongPlayPauseBtn = songs.currentSongEl.querySelector(
    'i#play-pause'
  );

  playPauseBtnPlayer.className = playPauseBtnPlayer.className.replaceAll(
    from,
    to
  );

  currentSongPlayPauseBtn.className = currentSongPlayPauseBtn.className.replaceAll(
    from,
    to
  );
};

const displayLyrics = function (songEl) {
  const songJSON = songs.allSongs.find(song => song.id == songEl.id);
  songContainer.innerHTML = songJSON.embed_content;
};

// play song when clicked on play button on search song container
songContainer.addEventListener('click', function (e) {
  if (e.target.id !== 'play-pause' && e.target.className !== 'lyrics-btn')
    return;

  if (e.target.className.includes('pause')) {
    playPauseFunctionality();
    return;
  }
  if (e.target.className === 'lyrics-btn') {
    displayLyrics(e.target.closest('.song'));
    return;
  }

  const clickedSong = e.target.closest('.song');
  const getSongFromArray = songs.allSongs.filter(
    song => song.id == clickedSong.id
  );

  songs.currentSongEl = clickedSong;
  songs.currentSongJSON = getSongFromArray;
  playPauseIconSwitch('play', 'pause');
  playClickedSong(...getSongFromArray);
});

document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();
  const input = document.querySelector('input');
  searchSongByName(input);

  songs.allSongs = [];
  input.value = '';
});
