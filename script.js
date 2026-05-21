const folderSongs = [
    { title: 'Audio 1', artist: 'Folder Track', src: 'audio/Audio1.mp3' },
    { title: 'Audio 2', artist: 'Folder Track', src: 'audio/Audio2.mp3' },
    { title: 'Audio 3', artist: 'Folder Track', src: 'audio/audio3.mp3' },
    { title: 'Audio 4', artist: 'Folder Track', src: 'audio/audio4.mp3' },
    { title: 'Audio 5', artist: 'Folder Track', src: 'audio/Audio5.mp3' },
    { title: 'Audio 6', artist: 'Folder Track', src: 'audio/Audio6.mp3' }
];

const audioPlayer = document.getElementById('audioPlayer');
const folderSongsContainer = document.getElementById('folderSongsContainer');
const playerSong = document.querySelector('.player-song');
const playerArtist = document.querySelector('.player-artist');

function renderFolderSongs() {
    if (!folderSongsContainer) return;
    folderSongsContainer.innerHTML = '';

    folderSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="song-image" style="background: linear-gradient(135deg, #34d399 0%, #10b981 100%);">
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
        });

        folderSongsContainer.appendChild(card);
    });
}

function playFolderSong(index) {
    const song = folderSongs[index];
    if (!song || !audioPlayer) return;

    audioPlayer.src = song.src;
    audioPlayer.play().catch(() => {
        console.log(`Unable to play ${song.title}.`);
    });
    playerSong.textContent = song.title;
    playerArtist.textContent = song.artist;
}

renderFolderSongs();

// Play button functionality
document.querySelectorAll('.play-btn, .play-small, .play-btn-large').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('Playing song...');
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

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
searchBar.addEventListener('focus', function () {
    this.style.boxShadow = '0 0 0 2px #1DB954';
});

searchBar.addEventListener('blur', function () {
    this.style.boxShadow = 'none';
});

// Volume slider update
const volumeSlider = document.querySelector('.volume-slider');
volumeSlider.addEventListener('input', function () {
    const value = this.value;
    this.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${value}%, rgba(255, 255, 255, 0.2) ${value}%, rgba(255, 255, 255, 0.2) 100%)`;
});

// Progress bar click
const progress = document.querySelector('.progress');
progress.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const width = rect.width;
    const x = e.clientX - rect.left;
    const percentage = (x / width) * 100;
    document.querySelector('.progress-fill').style.width = percentage + '%';
});

// Heart button toggle
document.querySelector('.heart-btn').addEventListener('click', function () {
    if (this.classList.contains('liked')) {
        this.classList.remove('liked');
        this.innerHTML = '<i class="far fa-heart"></i>';
    } else {
        this.classList.add('liked');
        this.innerHTML = '<i class="fas fa-heart"></i>';
    }
});

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

