class MusifyApp {
    constructor() {
        this.currentSong = 0;
        this.isPlaying = false;
        this.currentSection = 'home';
        this.volume = 0.7;
        this.currentTime = 0;
        this.duration = 225; // 3:45 in seconds
        this.isShuffled = false;
        this.repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
        this.queue = [];
        this.originalQueue = [];
        this.history = [];
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        
        // Sample audio URLs (you can replace these with actual audio files)
        this.songs = [
            {
                title: 'Midnight Drive',
                artist: 'Synthwave Collection',
                image: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '3:45',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' // Sample audio
            },
            {
                title: 'Ocean Waves',
                artist: 'Ambient Sounds',
                image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '4:12',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Electric Dreams',
                artist: 'Electronic Beats',
                image: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '3:28',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Golden Hour',
                artist: 'Indie Folk Mix',
                image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '4:01',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Urban Nights',
                artist: 'Hip-Hop Essentials',
                image: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '3:33',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Daily Mix 1',
                artist: 'Arctic Monkeys, The Strokes and more',
                image: 'https://images.pexels.com/photos/1708936/pexels-photo-1708936.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '52:18',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Daily Mix 2',
                artist: 'Tame Impala, MGMT and more',
                image: 'https://images.pexels.com/photos/1820563/pexels-photo-1820563.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '48:25',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Discover Weekly',
                artist: 'Your weekly mixtape of fresh music',
                image: 'https://images.pexels.com/photos/1933900/pexels-photo-1933900.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '2:15:32',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            }
        ];
        
        this.searchResults = [
            {
                title: 'Neon Lights',
                artist: 'Synthwave Artist',
                image: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '3:24',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Starlight',
                artist: 'Electronic Producer',
                image: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '4:15',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            },
            {
                title: 'Digital Dreams',
                artist: 'Future Beats',
                image: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=300',
                duration: '3:52',
                url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
            }
        ];

        this.playlists = [
            { name: 'My Playlist #1', songs: [0, 1, 2], icon: 'fas fa-music' },
            { name: 'Road Trip Mix', songs: [3, 4, 5], icon: 'fas fa-car' },
            { name: 'Chill Vibes', songs: [1, 2, 7], icon: 'fas fa-leaf' },
            { name: 'Workout Hits', songs: [4, 5, 6], icon: 'fas fa-dumbbell' },
            { name: 'Indie Discoveries', songs: [0, 3, 7], icon: 'fas fa-star' }
        ];

        this.likedSongs = new Set();
        this.audioPlayer = document.getElementById('audio-player');
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.delay(2000); // Simulate loading time
        this.hideLoadingScreen();
        
        this.setupEventListeners();
        this.updatePlayerInfo();
        this.updateGreeting();
        this.initializeQueue();
        this.setupAudioContext();
        this.startProgressUpdate();
        this.setupKeyboardShortcuts();
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.remove('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Play buttons on cards and quick picks
        document.querySelectorAll('[data-song]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const songIndex = parseInt(element.dataset.song);
                this.playSong(songIndex);
            });
        });

        // Player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousSong();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextSong();
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        document.getElementById('repeat-btn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        // Progress bar
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => {
            this.setProgress(e);
        });

        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        volumeSlider.addEventListener('click', (e) => {
            this.setVolume(e);
        });

        document.getElementById('volume-btn').addEventListener('click', () => {
            this.toggleMute();
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
            searchClear.classList.toggle('show', e.target.value.length > 0);
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
            searchClear.classList.remove('show');
        });

        // Heart button
        document.getElementById('player-heart').addEventListener('click', () => {
            this.toggleLike();
        });

        // Library tabs
        document.querySelectorAll('.lib-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchLibraryTab(e.target);
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.searchByCategory(card.dataset.category);
            });
        });

        // Back and forward buttons
        document.getElementById('back-btn').addEventListener('click', () => {
            this.goBack();
        });

        document.getElementById('forward-btn').addEventListener('click', () => {
            this.goForward();
        });

        // Like buttons on cards
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSongLike(btn);
            });
        });

        // More buttons (context menu)
        document.querySelectorAll('.more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showContextMenu(e, btn);
            });
        });

        // Audio player events
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            this.duration = this.audioPlayer.duration;
            document.getElementById('total-time').textContent = this.formatTime(this.duration);
        });

        this.audioPlayer.addEventListener('timeupdate', () => {
            this.currentTime = this.audioPlayer.currentTime;
            this.updateProgress();
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.handleSongEnd();
        });

        this.audioPlayer.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
            this.showTrackAnimation();
        });

        this.audioPlayer.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayPauseButton();
            this.hideTrackAnimation();
        });

        // Playlist items
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const playlistIndex = parseInt(item.dataset.playlist);
                this.playPlaylist(playlistIndex);
            });
        });

        // Create playlist
        document.getElementById('create-playlist').addEventListener('click', () => {
            this.createNewPlaylist();
        });

        // Close context menu when clicking outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Show all buttons
        document.querySelectorAll('.show-all-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showAllItems(btn);
            });
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Prevent shortcuts when typing in input fields
            if (e.target.tagName === 'INPUT') return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowRight':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.nextSong();
                    }
                    break;
                case 'ArrowLeft':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.previousSong();
                    }
                    break;
                case 'ArrowUp':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.adjustVolume(0.1);
                    }
                    break;
                case 'ArrowDown':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.adjustVolume(-0.1);
                    }
                    break;
            }
        });
    }

    setupAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            const source = this.audioContext.createMediaElementSource(this.audioPlayer);
            source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
        } catch (error) {
            console.log('Web Audio API not supported');
        }
    }

    initializeQueue() {
        this.queue = [...Array(this.songs.length).keys()];
        this.originalQueue = [...this.queue];
    }

    updateGreeting() {
        const hour = new Date().getHours();
        const greetingElement = document.getElementById('greeting-text');
        
        if (hour < 12) {
            greetingElement.textContent = 'Good morning';
        } else if (hour < 18) {
            greetingElement.textContent = 'Good afternoon';
        } else {
            greetingElement.textContent = 'Good evening';
        }
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        // Show/hide search container
        const searchContainer = document.getElementById('search-container');
        if (section === 'search') {
            searchContainer.classList.add('show');
            document.getElementById('search-input').focus();
        } else {
            searchContainer.classList.remove('show');
        }

        this.currentSection = section;
        this.addToHistory(section);
    }

    playSong(songIndex) {
        if (songIndex >= 0 && songIndex < this.songs.length) {
            this.currentSong = songIndex;
            const song = this.songs[songIndex];
            
            // Update audio source
            this.audioPlayer.src = song.url;
            this.audioPlayer.load();
            
            this.isPlaying = true;
            this.currentTime = 0;
            this.updatePlayerInfo();
            this.updatePlayPauseButton();
            
            // Play audio
            this.audioPlayer.play().catch(error => {
                console.log('Playback failed:', error);
                // Fallback to simulation mode
                this.simulatePlayback();
            });
            
            // Add playing animation
            this.updatePlayingStates();
            this.showTrackAnimation();
        }
    }

    simulatePlayback() {
        // Fallback simulation when actual audio fails
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.showTrackAnimation();
    }

    updatePlayingStates() {
        document.querySelectorAll('.music-card').forEach(card => {
            card.classList.remove('playing');
        });
        document.querySelector(`[data-song="${this.currentSong}"]`)?.classList.add('playing');
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
        } else {
            this.audioPlayer.play().catch(() => {
                this.simulatePlayback();
            });
        }
    }

    updatePlayPauseButton() {
        const btn = document.getElementById('play-pause-btn');
        const icon = btn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    showTrackAnimation() {
        const animation = document.querySelector('.track-animation');
        animation.classList.add('playing');
    }

    hideTrackAnimation() {
        const animation = document.querySelector('.track-animation');
        animation.classList.remove('playing');
    }

    previousSong() {
        if (this.currentTime > 3) {
            // If more than 3 seconds played, restart current song
            this.currentTime = 0;
            this.audioPlayer.currentTime = 0;
            return;
        }

        let prevSong;
        if (this.isShuffled) {
            // Get from history or random
            if (this.history.length > 1) {
                this.history.pop(); // Remove current
                prevSong = this.history.pop(); // Get previous
            } else {
                prevSong = Math.floor(Math.random() * this.songs.length);
            }
        } else {
            prevSong = this.currentSong > 0 ? this.currentSong - 1 : this.songs.length - 1;
        }
        
        this.playSong(prevSong);
    }

    nextSong() {
        let nextSong;
        
        if (this.isShuffled) {
            do {
                nextSong = Math.floor(Math.random() * this.songs.length);
            } while (nextSong === this.currentSong && this.songs.length > 1);
        } else {
            nextSong = this.currentSong < this.songs.length - 1 ? this.currentSong + 1 : 0;
        }
        
        this.playSong(nextSong);
    }

    handleSongEnd() {
        switch (this.repeatMode) {
            case 2: // Repeat one
                this.playSong(this.currentSong);
                break;
            case 1: // Repeat all
                this.nextSong();
                break;
            default: // No repeat
                if (this.currentSong < this.songs.length - 1 || this.isShuffled) {
                    this.nextSong();
                } else {
                    this.isPlaying = false;
                    this.updatePlayPauseButton();
                    this.hideTrackAnimation();
                }
        }
    }

    updatePlayerInfo() {
        const song = this.songs[this.currentSong];
        document.getElementById('player-image').src = song.image;
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artist').textContent = song.artist;
        
        // Update liked state
        const heartBtn = document.getElementById('player-heart');
        const icon = heartBtn.querySelector('i');
        if (this.likedSongs.has(this.currentSong)) {
            icon.className = 'fas fa-heart';
            heartBtn.classList.add('liked');
        } else {
            icon.className = 'far fa-heart';
            heartBtn.classList.remove('liked');
        }
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const btn = document.getElementById('shuffle-btn');
        btn.classList.toggle('active', this.isShuffled);
        
        if (this.isShuffled) {
            this.shuffleQueue();
        } else {
            this.queue = [...this.originalQueue];
        }
    }

    shuffleQueue() {
        const currentSongInQueue = this.queue.indexOf(this.currentSong);
        this.queue.splice(currentSongInQueue, 1);
        
        // Fisher-Yates shuffle
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
        
        this.queue.unshift(this.currentSong);
    }

    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const btn = document.getElementById('repeat-btn');
        const icon = btn.querySelector('i');
        
        btn.classList.toggle('active', this.repeatMode > 0);
        
        switch (this.repeatMode) {
            case 0:
                icon.className = 'fas fa-redo';
                break;
            case 1:
                icon.className = 'fas fa-redo';
                break;
            case 2:
                icon.className = 'fas fa-redo';
                icon.style.position = 'relative';
                break;
        }
    }

    setProgress(e) {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.currentTime = percent * this.duration;
        this.audioPlayer.currentTime = this.currentTime;
        this.updateProgress();
    }

    updateProgress() {
        if (this.duration > 0) {
            const percent = (this.currentTime / this.duration) * 100;
            document.getElementById('progress-fill').style.width = `${percent}%`;
            document.getElementById('current-time').textContent = this.formatTime(this.currentTime);
        }
    }

    startProgressUpdate() {
        setInterval(() => {
            if (this.isPlaying && !this.audioPlayer.src) {
                // Simulation mode
                this.currentTime += 1;
                if (this.currentTime >= this.duration) {
                    this.handleSongEnd();
                } else {
                    this.updateProgress();
                }
            }
        }, 1000);
    }

    setVolume(e) {
        const volumeSlider = e.currentTarget;
        const rect = volumeSlider.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.volume = Math.max(0, Math.min(1, percent));
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }

    adjustVolume(delta) {
        this.volume = Math.max(0, Math.min(1, this.volume + delta));
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const percent = this.volume * 100;
        document.getElementById('volume-fill').style.width = `${percent}%`;
        
        const volumeBtn = document.getElementById('volume-btn');
        const icon = volumeBtn.querySelector('i');
        
        if (this.volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (this.volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    toggleMute() {
        if (this.volume > 0) {
            this.previousVolume = this.volume;
            this.volume = 0;
        } else {
            this.volume = this.previousVolume || 0.7;
        }
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }

    toggleLike() {
        if (this.likedSongs.has(this.currentSong)) {
            this.likedSongs.delete(this.currentSong);
        } else {
            this.likedSongs.add(this.currentSong);
        }
        this.updatePlayerInfo();
        this.showNotification(this.likedSongs.has(this.currentSong) ? 'Added to Liked Songs' : 'Removed from Liked Songs');
    }

    toggleSongLike(btn) {
        const card = btn.closest('[data-song]');
        const songIndex = parseInt(card.dataset.song);
        const icon = btn.querySelector('i');
        
        if (this.likedSongs.has(songIndex)) {
            this.likedSongs.delete(songIndex);
            icon.className = 'far fa-heart';
            btn.classList.remove('liked');
        } else {
            this.likedSongs.add(songIndex);
            icon.className = 'fas fa-heart';
            btn.classList.add('liked');
        }
    }

    handleSearch(query) {
        const searchResults = document.getElementById('search-results');
        const resultsGrid = document.getElementById('results-grid');
        
        if (query.trim() === '') {
            searchResults.style.display = 'none';
            return;
        }

        searchResults.style.display = 'block';
        
        // Search in both songs and search results
        const allSongs = [...this.songs, ...this.searchResults];
        const filteredResults = allSongs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );

        resultsGrid.innerHTML = filteredResults.map((song, index) => `
            <div class="music-card" data-song="${index}" data-search="true">
                <div class="card-image">
                    <img src="${song.image}" alt="${song.title}">
                    <div class="card-overlay">
                        <button class="card-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn like-btn">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn more-btn">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </div>
        `).join('');

        // Add event listeners to new search result cards
        resultsGrid.querySelectorAll('[data-song]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const songIndex = parseInt(element.dataset.song);
                if (songIndex < filteredResults.length) {
                    this.playSongFromSearch(filteredResults[songIndex]);
                }
            });
        });
    }

    playSongFromSearch(song) {
        // Update player with search result
        document.getElementById('player-image').src = song.image;
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artist').textContent = song.artist;
        
        this.audioPlayer.src = song.url;
        this.audioPlayer.load();
        
        this.isPlaying = true;
        this.currentTime = 0;
        this.updatePlayPauseButton();
        
        this.audioPlayer.play().catch(() => {
            this.simulatePlayback();
        });
    }

    searchByCategory(category) {
        const searchInput = document.getElementById('search-input');
        searchInput.value = category;
        this.handleSearch(category);
        document.getElementById('search-clear').classList.add('show');
    }

    switchLibraryTab(selectedTab) {
        document.querySelectorAll('.lib-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        selectedTab.classList.add('active');
        
        // Here you could filter the library content based on the selected tab
        this.filterLibraryContent(selectedTab.textContent);
    }

    filterLibraryContent(tabName) {
        // Implementation for filtering library content
        console.log(`Filtering library by: ${tabName}`);
    }

    playPlaylist(playlistIndex) {
        const playlist = this.playlists[playlistIndex];
        if (playlist && playlist.songs.length > 0) {
            this.queue = [...playlist.songs];
            this.originalQueue = [...this.queue];
            this.playSong(playlist.songs[0]);
            this.showNotification(`Playing ${playlist.name}`);
        }
    }

    createNewPlaylist() {
        const name = prompt('Enter playlist name:');
        if (name && name.trim()) {
            const newPlaylist = {
                name: name.trim(),
                songs: [],
                icon: 'fas fa-music'
            };
            this.playlists.push(newPlaylist);
            this.updatePlaylistsUI();
            this.showNotification(`Created playlist: ${name}`);
        }
    }

    updatePlaylistsUI() {
        const playlistsContainer = document.querySelector('.playlists');
        playlistsContainer.innerHTML = this.playlists.map((playlist, index) => `
            <div class="playlist-item" data-playlist="${index}">
                <i class="${playlist.icon}"></i>
                ${playlist.name}
            </div>
        `).join('');
        
        // Re-add event listeners
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const playlistIndex = parseInt(item.dataset.playlist);
                this.playPlaylist(playlistIndex);
            });
        });
    }

    showContextMenu(e, btn) {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.left = `${e.pageX}px`;
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.classList.add('show');
        
        setTimeout(() => {
            contextMenu.classList.remove('show');
        }, 3000);
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.classList.remove('show');
    }

    addToHistory(section) {
        this.history.push(section);
        if (this.history.length > 10) {
            this.history.shift();
        }
    }

    goBack() {
        if (this.history.length > 1) {
            this.history.pop(); // Remove current
            const previousSection = this.history.pop(); // Get previous
            this.switchSection(previousSection);
        }
    }

    goForward() {
        // Simple forward functionality - could be expanded with forward history
        console.log('Going forward...');
    }

    showAllItems(btn) {
        const section = btn.closest('.content-row');
        const grid = section.querySelector('.card-grid, .artist-grid');
        
        // Add animation class
        grid.classList.add('show-all');
        btn.style.display = 'none';
        
        // Here you could load more items dynamically
        this.showNotification('Showing all items');
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--background-lighter);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 8px 24px var(--shadow-heavy);
            z-index: 1000;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
        }, 100);
        
        // Hide notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MusifyApp();
});

// Add additional interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Enhanced hover effects
    document.querySelectorAll('.music-card, .artist-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Enhanced button interactions
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });

    // Smooth scrolling
    document.querySelectorAll('.main-content').forEach(section => {
        section.style.scrollBehavior = 'smooth';
    });

    // Image loading effects
    document.querySelectorAll('img').forEach(img => {
        img.style.opacity = '0';
        img.addEventListener('load', () => {
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '1';
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('.control-btn, .play-btn, .card-play-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .notification {
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
        }
        
        .show-all {
            animation: expandGrid 0.5s ease;
        }
        
        @keyframes expandGrid {
            from {
                max-height: 400px;
                overflow: hidden;
            }
            to {
                max-height: none;
            }
        }
    `;
    document.head.appendChild(style);
});