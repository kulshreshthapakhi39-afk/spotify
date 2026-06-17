const folderSongs = [
    { title: 'Fresher Student', artist: 'College Vibes', src: 'audio/Audio1.mp3', image: 'images/Image1.jpg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'College Dreams', artist: 'Indie Pop', src: 'audio/Audio2.mp3', image: 'images/Image2.jpg', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Student Life', artist: 'Hip Hop', src: 'audio/audio3.mp3', image: 'images/Image3.jpg', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Midnight Study', artist: 'Lo-Fi Hip Hop', src: 'audio/audio4.mp3', image: 'images/Image4.jpg', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Young & Free', artist: 'Indie Rock', src: 'audio/Audio5.mp3', image: 'images/Image5.jpg', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { title: 'Campus Nights', artist: 'Electronic', src: 'audio/Audio6.mp3', image: 'images/Image5.jpg', gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' }
];

const audioPlayer = document.getElementById('audioPlayer');
const folderSongsContainer = document.getElementById('folderSongsContainer');
const uploadedSongsContainer = document.getElementById('uploadedSongsContainer');
const playerSong = document.querySelector('.player-song');
const playerArtist = document.querySelector('.player-artist');
const uploadBtn = document.getElementById('uploadBtn');
const songUpload = document.getElementById('songUpload');
const fileLabel = document.getElementById('fileLabel');
const favoriteCount = document.getElementById('favoriteCount');
const shuffleBtn = document.querySelector('.shuffle-btn');
const repeatBtn = document.querySelector('.repeat-btn');
const heartBtn = document.querySelector('.heart-btn');

// Playlist state
let currentSongIndex = -1;
let isPlayingAll = false;
let isPlaying = false;
let shuffleMode = false;
let repeatMode = false;
const likedSongs = new Set(JSON.parse(localStorage.getItem('likedSongs') || '[]'));

function saveLikedSongs() {
    localStorage.setItem('likedSongs', JSON.stringify([...likedSongs]));
}

function updateFavoriteCount() {
    if (!favoriteCount) return;
    favoriteCount.textContent = `${likedSongs.size} liked`;
}

function updateHeartButton() {
    if (!heartBtn) return;
    const activeSong = folderSongs[currentSongIndex];
    const songKey = activeSong ? `${activeSong.title} - ${activeSong.artist}` : null;
    if (songKey && likedSongs.has(songKey)) {
        heartBtn.classList.add('liked');
        heartBtn.innerHTML = '<i class="fas fa-heart"></i>';
    } else {
        heartBtn.classList.remove('liked');
        heartBtn.innerHTML = '<i class="far fa-heart"></i>';
    }
}

function setNowPlaying(song) {
    playerSong.textContent = song.title;
    playerArtist.textContent = song.artist;
    const playerAlbumArt = document.querySelector('.player-album-art');
    if (playerAlbumArt) {
        playerAlbumArt.style.backgroundImage = song.image ? `url('${song.image}')` : song.gradient || '';
        playerAlbumArt.style.backgroundSize = 'cover';
        playerAlbumArt.style.backgroundPosition = 'center';
    }
    updateHeartButton();
}

function renderFolderSongs() {
    if (!folderSongsContainer) return;
    folderSongsContainer.innerHTML = '';

    folderSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="song-image" style="background: ${song.gradient};">
                <img src="${song.image}" alt="${song.title}" class="song-img" onerror="this.style.display='none'">
                <div class="play-btn">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
        `;

        folderSongsContainer.appendChild(card);
    });
}

function renderUploadedSongs() {
    if (!uploadedSongsContainer) return;
    uploadedSongsContainer.innerHTML = '';
    const uploads = folderSongs.filter(song => song.uploaded);

    if (uploads.length === 0) {
        uploadedSongsContainer.innerHTML = '<p class="upload-placeholder">No uploaded tracks yet.</p>';
        return;
    }

    uploads.forEach((song) => {
        const index = folderSongs.indexOf(song);
        const item = document.createElement('div');
        item.className = 'uploaded-item';
        item.dataset.index = index;
        item.innerHTML = `
            <div class="uploaded-info">
                <span>${song.title}</span>
                <small>${song.artist}</small>
            </div>
            <button class="uploaded-play-btn"><i class="fas fa-play"></i></button>
        `;

        item.addEventListener('click', () => {
            playFolderSong(index);
            isPlayingAll = false;
        });

        uploadedSongsContainer.appendChild(item);
    });
}

function bindSongCardEvents() {
    document.querySelectorAll('.song-card[data-index]').forEach(card => {
        card.addEventListener('click', () => {
            const index = Number(card.dataset.index);
            if (!Number.isNaN(index)) {
                playFolderSong(index);
                isPlayingAll = false;
            }
        });
    });
}

function updatePlayButton() {
    const playBtn = document.querySelector('.play-btn-large');
    if (!playBtn) return;
    playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    if (shuffleBtn) {
        shuffleBtn.classList.toggle('active', shuffleMode);
    }
}

function toggleRepeat() {
    repeatMode = !repeatMode;
    if (repeatBtn) {
        repeatBtn.classList.toggle('active', repeatMode);
    }
}

function getNextIndex() {
    if (shuffleMode) {
        let next = Math.floor(Math.random() * folderSongs.length);
        if (next === currentSongIndex && folderSongs.length > 1) {
            next = (next + 1) % folderSongs.length;
        }
        return next;
    }
    const nextIndex = currentSongIndex + 1;
    if (nextIndex < folderSongs.length) return nextIndex;
    return repeatMode ? 0 : -1;
}

function getPreviousIndex() {
    if (shuffleMode) {
        return Math.floor(Math.random() * folderSongs.length);
    }
    if (currentSongIndex > 0) return currentSongIndex - 1;
    return repeatMode ? folderSongs.length - 1 : currentSongIndex;
}

function playFolderSong(index) {
    const song = folderSongs[index];
    if (!song || !audioPlayer) return;

    currentSongIndex = index;
    audioPlayer.src = song.src;
    audioPlayer.play().catch(() => {
        console.log(`Unable to play ${song.title}.`);
    });
    setNowPlaying(song);
    isPlaying = true;
    updatePlayButton();
}

function playNextSong() {
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
        playFolderSong(nextIndex);
        isPlayingAll = true;
    } else {
        isPlayingAll = false;
        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();
    }
}

function playPreviousSong() {
    const prevIndex = getPreviousIndex();
    if (prevIndex >= 0 && prevIndex < folderSongs.length) {
        playFolderSong(prevIndex);
        isPlayingAll = false;
    }
}

function togglePlayPause() {
    if (currentSongIndex === -1) {
        if (folderSongs.length > 0) {
            playFolderSong(0);
            isPlayingAll = false;
        }
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    updatePlayButton();
}

renderFolderSongs();
renderUploadedSongs();
updateFavoriteCount();

// Play All button functionality
const playAllBtn = document.getElementById('playAllBtn');

function filterCards(query) {
    const term = query.toLowerCase().trim();
    document.querySelectorAll('.song-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(term) ? '' : 'none';
    });
    document.querySelectorAll('.track-row').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
    document.querySelectorAll('.uploaded-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? '' : 'none';
    });
}

const searchBar = document.querySelector('.search-bar');
if (searchBar) {
    searchBar.addEventListener('input', (e) => filterCards(e.target.value));
}
if (playAllBtn) {
    playAllBtn.addEventListener('click', function () {
        if (folderSongs.length > 0) {
            isPlayingAll = true;
            playFolderSong(0);
        }
    });
}


// Auto play next song when current song ends
audioPlayer.addEventListener('ended', function () {
    playNextSong();
});

// Update progress bar as song plays
audioPlayer.addEventListener('timeupdate', function () {
    if (audioPlayer.duration) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        document.querySelector('.progress-fill').style.width = percentage + '%';

        // Update time display
        const minutes = Math.floor(audioPlayer.currentTime / 60);
        const seconds = Math.floor(audioPlayer.currentTime % 60);
        document.querySelector('.time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // Update total duration on metadata load
        if (!audioPlayer.dataset.durationSet) {
            const totalMinutes = Math.floor(audioPlayer.duration / 60);
            const totalSeconds = Math.floor(audioPlayer.duration % 60);
            document.querySelectorAll('.time')[1].textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
            audioPlayer.dataset.durationSet = 'true';
        }
    }
});

// Play button animation
document.querySelectorAll('.play-btn, .play-small').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    });
});

// Large play button in player
const playBtnLarge = document.querySelector('.play-btn-large');
if (playBtnLarge) {
    playBtnLarge.addEventListener('click', function (e) {
        e.preventDefault();
        togglePlayPause();
    });
}

// Next and Previous buttons
const controlBtns = document.querySelectorAll('.control-btn');
if (controlBtns.length >= 5) {
    controlBtns[1].addEventListener('click', function () {
        playPreviousSong();
    });
    controlBtns[3].addEventListener('click', function () {
        playNextSong();
    });
}

// Shuffle and Repeat buttons
if (shuffleBtn) {
    shuffleBtn.addEventListener('click', toggleShuffle);
}
if (repeatBtn) {
    repeatBtn.addEventListener('click', toggleRepeat);
}

// Table play buttons
document.querySelectorAll('.play-small').forEach(button => {
    const index = Number(button.dataset.index);
    button.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!Number.isNaN(index)) {
            playFolderSong(index);
            isPlayingAll = false;
        }
    });
});

// Search focus styling
if (searchBar) {
    searchBar.addEventListener('focus', function () {
        this.style.boxShadow = '0 0 0 2px #1DB954';
    });

    searchBar.addEventListener('blur', function () {
        this.style.boxShadow = 'none';
    });
}

// Volume slider update
const volumeSlider = document.querySelector('.volume-slider');
if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
        const value = this.value;
        audioPlayer.volume = value / 100;
        this.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${value}%, rgba(255, 255, 255, 0.2) ${value}%, rgba(255, 255, 255, 0.2) 100%)`;
    });
}

// Progress bar click
const progress = document.querySelector('.progress');
if (progress) {
    progress.addEventListener('click', function (e) {
        if (audioPlayer.duration) {
            const rect = this.getBoundingClientRect();
            const width = rect.width;
            const x = e.clientX - rect.left;
            const percentage = (x / width) * 100;
            audioPlayer.currentTime = (percentage / 100) * audioPlayer.duration;
            document.querySelector('.progress-fill').style.width = percentage + '%';
        }
    });
}

// Heart button toggle
if (heartBtn) {
    heartBtn.addEventListener('click', function () {
        const activeSong = folderSongs[currentSongIndex];
        if (!activeSong) return;
        const songKey = `${activeSong.title} - ${activeSong.artist}`;
        if (likedSongs.has(songKey)) {
            likedSongs.delete(songKey);
        } else {
            likedSongs.add(songKey);
        }
        saveLikedSongs();
        updateFavoriteCount();
        updateHeartButton();
    });
}

// Track table row click
document.querySelectorAll('.track-row').forEach(row => {
    row.addEventListener('click', function () {
        const title = this.querySelector('td:nth-child(2)')?.textContent;
        const artist = this.querySelector('td:nth-child(3)')?.textContent;
        if (title && artist) {
            console.log(`Playing: ${title} - ${artist}`);
        }
    });
});

// Navigation item active state
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// Playlist item click
document.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        console.log(`Opened playlist: ${this.textContent}`);
    });
});

uploadBtn?.addEventListener('click', () => songUpload?.click());

songUpload?.addEventListener('change', () => {
    const file = songUpload.files[0];
    if (!file) return;

    if (fileLabel) {
        fileLabel.textContent = file.name.length > 24 ? `${file.name.slice(0, 21)}...` : file.name;
    }

    const objectUrl = URL.createObjectURL(file);
    const title = file.name.replace(/\.[^/.]+$/, '');
    const newSong = {
        title,
        artist: 'Your Upload',
        src: objectUrl,
        image: '',
        gradient: 'linear-gradient(135deg, #6a5af9 0%, #22d3ee 100%)',
        uploaded: true
    };
    folderSongs.push(newSong);
    renderFolderSongs();
    renderUploadedSongs();
    bindSongCardEvents();

    currentSongIndex = folderSongs.length - 1;
    isPlayingAll = false;
    audioPlayer.src = objectUrl;
    audioPlayer.play().catch(() => { });
    setNowPlaying(newSong);
    isPlaying = true;
    updatePlayButton();
    updateFavoriteCount();
    updateHeartButton();
    songUpload.value = '';
});

const greeting = document.querySelector('.eyebrow');
if (greeting) {
    const hour = new Date().getHours();
    const label = hour < 12 ? 'Morning pulse' : hour < 18 ? 'Afternoon glow' : 'Midnight pulse';
    greeting.textContent = `${label} • Curated for late-night focus`;
}

console.log('Spotify Website Loaded Successfully! 🎵');
