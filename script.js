const songContainer = document.querySelector('.song-container');

// genius api
const accessToken =
  '?access_token=CXyFeSBw2lAdG41xkuU3LS6a_nwyxwwCz2dCkUohw-rw0C49x2HqP__6_4is5RPx';
const APISearch = 'https://api.genius.com/search';
const APISong = 'https://api.genius.com/songs/';
const songID = '213';
const songIDArray = ['2471960', '3315890', '3359190', '725791', '521662'];

// where all fetched songs are stored
const songs = [];

const searchSong = async function (id) {
  try {
    if (!id) return;

    const res = await fetch(`${APISong}${id}${accessToken}`);
    const data = await res.json();

    songs.push(data.response.song);
    displaySong(data.response.song);
  } catch (error) {
    console.log(error);
  }
};

songIDArray.forEach(id => searchSong(id));

const displaySong = function (song) {
  const artist = song.primary_artist.name;
  const songName = song.title;
  const html = `
    <div class="song" id=${song.id}>
    <div class="song-details">
      <img
        src=${song.song_art_image_url}
        alt=""
      />
      <i class="fas fa-play"></i>
      <h4>${artist} - ${songName}</h4>
      <p>Lyrics</p>
    </div>
    <div class="social">
      ${displaySocialMedia(song.media)}
    </div>
  </div>
    `;
  songContainer.insertAdjacentHTML('beforeend', html);
};

const displaySocialMedia = function (media) {
  let html = '';
  media.forEach(
    social =>
      (html += `<a href=${social.url}><i class="fab fa-${social.provider} ${social.provider} fa-lg"></i></a>`)
  );

  return html;
};

const playClickedSong = async function (song) {
  // search for youtube url of song
  const youtubeUrl = song.media.find(player => player.provider === 'youtube')
    .url;
  if (!youtubeUrl) return;
  console.log(youtubeUrl);
  const youtubeUrlCode = youtubeUrl.slice(youtubeUrl.indexOf('?v=') + 3);
  const html = `
  <iframe src="https://www.youtube.com/embed/${youtubeUrlCode}?autoplay=1&loop=1&autopause=0" width="640" height="360 allow="autoplay"></iframe>
    `;
  document.body.insertAdjacentHTML('beforeend', html);
};

// play song when clicked on play button on search song container
songContainer.addEventListener('click', function (e) {
  if (!e.target.className.includes('play')) return;
  const clickedSong = e.target.closest('.song');
  const getSongFromArray = songs.filter(song => song.id == clickedSong.id);
  playClickedSong(...getSongFromArray);
});
