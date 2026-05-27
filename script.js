const folderSongs = [
    { title: 'Audio 1', artist: 'Folder Track', src: 'audio/Audio1.mp3', image: 'images/Image1.jpg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'Audio 2', artist: 'Folder Track', src: 'audio/Audio2.mp3', image: 'images/Image2.jpg', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Audio 3', artist: 'Folder Track', src: 'audio/audio3.mp3', image: 'images/Image3.jpg', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Audio 4', artist: 'Folder Track', src: 'audio/audio4.mp3', image: 'images/Image4.jpg', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Audio 5', artist: 'Folder Track', src: 'audio/Audio5.mp3', image: 'images/Image5.jpg', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { title: 'Audio 6', artist: 'Folder Track', src: 'audio/Audio6.mp3', image: 'images/Image5.jpg', gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)' }
];



const audioPlayer = document.getElementById('audioPlayer');
const folderSongsContainer = document.getElementById('folderSongsContainer');
const playerSong = document.querySelector('.player-song');
const playerArtist = document.querySelector('.player-artist');

// Playlist state
let currentSongIndex = -1;
let isPlayingAll = false;
let isPlaying = false;

function renderFolderSongs() {
    if (!folderSongsContainer) return;
    folderSongsContainer.innerHTML = '';

    folderSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
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

        card.addEventListener('click', () => {
            playFolderSong(index);
            isPlayingAll = false;
        });

        folderSongsContainer.appendChild(card);
    });
}

function playFolderSong(index) {
    const song = folderSongs[index];
    if (!song || !audioPlayer) return;

    currentSongIndex = index;
    audioPlayer.src = song.src;
    audioPlayer.play().catch(() => {
        console.log(`Unable to play ${song.title}.`);
    });
    playerSong.textContent = song.title;
    playerArtist.textContent = song.artist;

    // Update player album art
    const playerAlbumArt = document.querySelector('.player-album-art');
    if (playerAlbumArt && song.image) {
        playerAlbumArt.style.backgroundImage = `url('${song.image}')`;
        playerAlbumArt.style.backgroundSize = 'cover';
        playerAlbumArt.style.backgroundPosition = 'center';
    }

    isPlaying = true;

    // Update play button
    const playBtn = document.querySelector('.play-btn-large');
    if (playBtn) {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

function playNextSong() {
    if (isPlayingAll) {
        const nextIndex = currentSongIndex + 1;
        if (nextIndex < folderSongs.length) {
            playFolderSong(nextIndex);
        } else {
            // Reached end of playlist
            isPlayingAll = false;
            audioPlayer.pause();
            isPlaying = false;
            const playBtn = document.querySelector('.play-btn-large');
            if (playBtn) {
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        }
    }
}

function playPreviousSong() {
    if (currentSongIndex > 0) {
        playFolderSong(currentSongIndex - 1);
    }
}

function togglePlayPause() {
    if (currentSongIndex === -1) return;

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        document.querySelector('.play-btn-large').innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audioPlayer.play();
        isPlaying = true;
        document.querySelector('.play-btn-large').innerHTML = '<i class="fas fa-pause"></i>';
    }
}

renderFolderSongs();

// Play All button functionality
const playAllBtn = document.getElementById('playAllBtn');
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

// Play button functionality
document.querySelectorAll('.play-btn, .play-small').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Playing song...');
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
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
if (controlBtns.length >= 3) {
    // Previous button
    controlBtns[0].addEventListener('click', function () {
        playPreviousSong();
    });

    // Next button
    controlBtns[2].addEventListener('click', function () {
        playNextSong();
    });
}

// Song card click
document.querySelectorAll('.song-card').forEach(card => {
    card.addEventListener('click', function () {
        const songTitle = this.querySelector('.song-info h3').textContent;
        const songArtist = this.querySelector('.song-info p').textContent;
        console.log(`Now playing: ${songTitle} by ${songArtist}`);
    });
});

// Search functionality
const searchBar = document.querySelector('.search-bar');
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
const heartBtn = document.querySelector('.heart-btn');
if (heartBtn) {
    heartBtn.addEventListener('click', function () {
        if (this.classList.contains('liked')) {
            this.classList.remove('liked');
            this.innerHTML = '<i class="far fa-heart"></i>';
        } else {
            this.classList.add('liked');
            this.innerHTML = '<i class="fas fa-heart"></i>';
        }
    });
}

// Track table row click
document.querySelectorAll('.tracks-table tbody tr').forEach(row => {
    row.addEventListener('click', function () {
        const title = this.querySelector('td:nth-child(2)').textContent;
        const artist = this.querySelector('td:nth-child(3)').textContent;
        console.log(`Playing: ${title} - ${artist}`);
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
console.log('Spotify Website Loaded Successfully! 🎵');