const folderSongs = [
    { title: 'Fresher Student', artist: 'College Vibes', src: 'audio/Audio1.mp3', image: 'images/Image1.jpg', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: 'College Dreams', artist: 'Indie Pop', src: 'audio/Audio2.mp3', image: 'images/Image2.jpg', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { title: 'Student Life', artist: 'Hip Hop', src: 'audio/audio3.mp3', image: 'images/Image3.jpg', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { title: 'Midnight Study', artist: 'Lo-Fi Hip Hop', src: 'audio/audio4.mp3', image: 'images/Image4.jpg', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { title: 'Young & Free', artist: 'Indie Rock', src: 'audio/Audio5.mp3', image: 'images/Image5.jpg', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
];

// ===== UTILITY FUNCTIONS =====
/**
 * Debounce function to optimize performance on frequent events
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Safe DOM query wrapper
 */
const q = (selector) => document.querySelector(selector);
const qa = (selector) => document.querySelectorAll(selector);

// ===== DOM ELEMENTS =====

// ===== DOM ELEMENTS =====
const audioPlayer = q('#audioPlayer');
const folderSongsContainer = q('#folderSongsContainer');
const uploadedSongsContainer = q('#uploadedSongsContainer');
const playerSong = q('.player-song');
const playerArtist = q('.player-artist');
const uploadBtn = q('#uploadBtn');
const songUpload = q('#songUpload');
const fileLabel = q('#fileLabel');
const favoriteCount = q('#favoriteCount');
const shuffleBtn = q('.shuffle-btn');
const repeatBtn = q('.repeat-btn');
const heartBtn = q('.heart-btn');
const searchBar = q('#searchBar');
const searchResultsInfo = q('#searchResultsInfo');
const playAllBtn = q('#playAllBtn');

// ===== PLAYER STATE =====

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

        uploadedSongsContainer.appendChild(item);
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

function updateSearchResultsInfo(query, matches) {
    if (!searchResultsInfo) return;
    if (!query) {
        searchResultsInfo.textContent = 'Search songs, artists, albums, and playlists.';
        return;
    }
    searchResultsInfo.textContent = matches === 0
        ? 'No results found. Try another song, artist, or album.'
        : `Showing ${matches} result${matches === 1 ? '' : 's'} for "${query}"`;
}

function filterCards(query) {
    const term = query.toLowerCase().trim();
    let visibleCount = 0;

    // Use event delegation for better performance on dynamically added elements
    const selectors = ['.song-card', '.track-row', '.uploaded-item'];

    selectors.forEach(selector => {
        qa(selector).forEach(card => {
            const text = card.textContent.toLowerCase();
            const visible = term.length === 0 || text.includes(term);
            card.style.display = visible ? '' : 'none';
            if (visible) visibleCount++;
        });
    });

    updateSearchResultsInfo(term, visibleCount);
}

// Debounce search input to improve performance
const debouncedSearch = debounce((query) => filterCards(query), 300);

if (searchBar) {
    searchBar.addEventListener('input', (e) => debouncedSearch(e.target.value));
}

// Play All button
if (playAllBtn) {
    playAllBtn.addEventListener('click', () => {
        if (folderSongs.length > 0) {
            isPlayingAll = true;
            playFolderSong(0);
        }
    });
}

// ===== EVENT DELEGATION FOR DYNAMIC ELEMENTS =====
// Handle song card clicks with event delegation
document.addEventListener('click', (e) => {
    const songCard = e.target.closest('.song-card[data-index]');
    if (songCard) {
        const index = Number(songCard.dataset.index);
        if (!Number.isNaN(index)) {
            playFolderSong(index);
            isPlayingAll = false;
        }
    }

    // Track row clicks
    const trackRow = e.target.closest('.track-row[data-index]');
    if (trackRow) {
        const index = Number(trackRow.dataset.index);
        if (!Number.isNaN(index)) {
            playFolderSong(index);
        }
    }

    // Play button in track table
    const playSmall = e.target.closest('.play-small[data-index]');
    if (playSmall) {
        const index = Number(playSmall.dataset.index);
        if (!Number.isNaN(index)) {
            playFolderSong(index);
            isPlayingAll = false;
        }
    }

    // Uploaded items
    const uploadedItem = e.target.closest('.uploaded-item[data-index]');
    if (uploadedItem) {
        const index = Number(uploadedItem.dataset.index);
        if (!Number.isNaN(index)) {
            playFolderSong(index);
            isPlayingAll = false;
        }
    }
});

// Auto play next song when current song ends
audioPlayer.addEventListener('ended', function () {
    playNextSong();
});

// Update progress bar as song plays
audioPlayer.addEventListener('timeupdate', function () {
    if (audioPlayer.duration) {
        const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const progressFill = q('.progress-fill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        // Update current time display
        const minutes = Math.floor(audioPlayer.currentTime / 60);
        const seconds = Math.floor(audioPlayer.currentTime % 60);
        const timeElements = qa('.time');
        if (timeElements.length > 0) {
            timeElements[0].textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }
});

// Update total duration on metadata load
audioPlayer.addEventListener('loadedmetadata', function () {
    if (!audioPlayer.dataset.durationSet) {
        const totalMinutes = Math.floor(audioPlayer.duration / 60);
        const totalSeconds = Math.floor(audioPlayer.duration % 60);
        const timeElements = qa('.time');
        if (timeElements.length > 1) {
            timeElements[1].textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
        }
        audioPlayer.dataset.durationSet = 'true';
    }
});

// ===== PLAYER CONTROLS EVENTS =====

// Large play button in player
const playBtnLarge = q('.play-btn-large');
if (playBtnLarge) {
    playBtnLarge.addEventListener('click', (e) => {
        e.preventDefault();
        togglePlayPause();
    });
}

// Next and Previous buttons using event delegation
document.addEventListener('click', (e) => {
    const controlBtns = qa('.control-btn');
    const nextBtn = controlBtns[3];
    const prevBtn = controlBtns[1];

    if (e.target.closest('.fa-step-forward') === nextBtn.querySelector('i')) {
        playNextSong();
    }
    if (e.target.closest('.fa-step-backward') === prevBtn.querySelector('i')) {
        playPreviousSong();
    }
});

// Shuffle and Repeat buttons
if (shuffleBtn) {
    shuffleBtn.addEventListener('click', toggleShuffle);
}
if (repeatBtn) {
    repeatBtn.addEventListener('click', toggleRepeat);
}

// Volume slider update
const volumeSlider = q('.volume-slider');
if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
        const value = this.value;
        audioPlayer.volume = value / 100;
        this.style.background = `linear-gradient(to right, #1DB954 0%, #1DB954 ${value}%, rgba(255, 255, 255, 0.2) ${value}%, rgba(255, 255, 255, 0.2) 100%)`;
    });
}

// Progress bar click
const progress = q('.progress');
if (progress) {
    progress.addEventListener('click', function (e) {
        if (audioPlayer.duration) {
            const rect = this.getBoundingClientRect();
            const width = rect.width;
            const x = e.clientX - rect.left;
            const percentage = (x / width) * 100;
            audioPlayer.currentTime = (percentage / 100) * audioPlayer.duration;
            const progressFill = q('.progress-fill');
            if (progressFill) {
                progressFill.style.width = percentage + '%';
            }
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

// Navigation item active state
document.addEventListener('click', (e) => {
    const navItem = e.target.closest('.nav-item');
    if (navItem) {
        e.preventDefault();
        qa('.nav-item').forEach(nav => nav.classList.remove('active'));
        navItem.classList.add('active');

        const searchText = navItem.textContent.trim().toLowerCase();
        if (searchText === 'search' && searchBar) {
            searchBar.focus();
        }
    }

    // Playlist item click
    const playlistItem = e.target.closest('.playlist-item');
    if (playlistItem) {
        e.preventDefault();
        console.log(`Opened playlist: ${playlistItem.textContent}`);
    }
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

const greeting = q('.eyebrow');
if (greeting) {
    const hour = new Date().getHours();
    const label = hour < 12 ? 'Morning pulse' : hour < 18 ? 'Afternoon glow' : 'Midnight pulse';
    greeting.textContent = `${label} • Curated for late-night focus`;
}

// ===== PROFILE MODAL MANAGEMENT =====
function showProfileModal() {
    if (profileModal) {
        profileModal.classList.remove('hidden');
        profileNameInput?.focus();
    }
}

function hideProfileModal() {
    if (profileModal) {
        profileModal.classList.add('hidden');
    }
}

function getSavedProfile() {
    try {
        return JSON.parse(localStorage.getItem('spotifyProfile')) || null;
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

function applySavedProfile() {
    const profile = getSavedProfile();
    if (profile && profileBtn) {
        profileBtn.innerHTML = `<i class="fas fa-user-circle"></i><span>${profile.name}</span>`;
    }
}

function saveProfile() {
    const name = profileNameInput?.value.trim() || '';
    const email = profileEmailInput?.value.trim() || '';
    const genre = profileGenreInput?.value.trim() || '';

    if (!name || !email) {
        alert('Please enter both name and email to create your profile.');
        return;
    }

    try {
        const profile = { name, email, genre, createdAt: new Date().toISOString() };
        localStorage.setItem('spotifyProfile', JSON.stringify(profile));
        applySavedProfile();
        hideProfileModal();
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
    }
}
}

// ===== PROFILE MODAL EVENTS =====
if (profileBtn) {
    profileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showProfileModal();
    });
}

if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => hideProfileModal());
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => saveProfile());
}

if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            hideProfileModal();
        }
    });
}

// ===== INITIALIZATION =====
applySavedProfile();
console.log('🎵 Spotify Player loaded successfully!');