class MusifyApp {
    constructor() {
        this.currentSongIndex = null;
        this.isPlaying = false;
        this.currentSection = 'home';
        this.volume = 0.7;
        this.previousVolume = 0.7;
        this.isShuffled = false;
        this.repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one
        this.queue = [];
        this.originalQueue = [];
        this.history = { past: [], future: [] };
        this.contextMenuSongIndex = null;
        this.playerDisplay = document.getElementById('player-display');
        
        // Use more realistic audio files for better testing
        this.songs = [
            { title: 'Lost in the City', artist: 'Cosmo Sheldrake', album: 'The Much Much How How and I', duration: 212, image: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
            { title: 'Forest Temple', artist: 'Koji Kondo', album: 'The Legend of Zelda', duration: 172, image: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
            { title: 'Aqua Vitae', artist: 'Future World Music', album: 'Behold', duration: 259, image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
            { title: 'Chasing the Wind', artist: 'Twelve Titans Music', album: 'Evermore', duration: 184, image: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
            { title: 'The Last Butterfly', artist: 'Clem Leek', album: 'Rest', duration: 162, image: 'https://images.pexels.com/photos/672101/pexels-photo-672101.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
            { title: 'A New Day', artist: 'Altan', album: 'The Widening Gyre', duration: 234, image: 'https://images.pexels.com/photos/1757363/pexels-photo-1757363.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
            { title: 'The Shire', artist: 'Howard Shore', album: 'The Lord of the Rings', duration: 135, image: 'https://images.pexels.com/photos/2361/nature-farm-agriculture-green.jpg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
            { title: 'Victory', artist: 'Two Steps From Hell', album: 'Battlecry', duration: 320, image: 'https://images.pexels.com/photos/842711/pexels-photo-842711.jpeg?auto=compress&cs=tinysrgb&w=300', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
        ];

        this.playlists = [
            { name: 'My Playlist #1', songs: [0, 1, 2], icon: 'fas fa-music' },
            { name: 'Road Trip Mix', songs: [3, 4, 5], icon: 'fas fa-car' },
            { name: 'Chill Vibes', songs: [1, 2, 7], icon: 'fas fa-leaf' },
        ];

        this.likedSongs = new Set([1, 4]);
        this.audioPlayer = document.getElementById('audio-player');
        
        this.init();
    }

    async init() {
        this.showLoadingScreen();
        await this.delay(1500);
        this.hideLoadingScreen();
        
        this.setupEventListeners();
        this.updateGreeting();
        this.initializeQueue();
        this.renderPlaylists();
        this.renderAllContent();
        this.updatePlayerInfo(); // Initial player state
        this.updateVolumeDisplay();
    }
    
    renderAllContent() {
        this.renderQuickPicks();
        this.renderCardGrid('recently-played-grid', this.songs.slice(0, 5));
        this.renderCardGrid('made-for-you-grid', this.songs.slice(5, 8));
        this.renderArtistGrid();
    }

    renderQuickPicks() {
        const container = document.querySelector('.quick-picks');
        const picks = this.songs.slice(0, 4);
        container.innerHTML = picks.map((song, index) => `
            <div class="quick-pick-item" data-song-index="${index}">
                <img src="${song.image}" alt="${song.title}">
                <span>${song.title}</span>
                <button class="play-btn">
                    <i class="fas fa-play"></i>
                </button>
            </div>
        `).join('');

        document.querySelectorAll('.quick-pick-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const songIndex = parseInt(item.dataset.songIndex);
                this.playSong(songIndex);
            });
        });
    }

    renderCardGrid(elementId, songs) {
        const grid = document.getElementById(elementId);
        grid.innerHTML = songs.map((song, index) => {
            const originalIndex = this.songs.indexOf(song);
            return `
            <div class="music-card" data-song-index="${originalIndex}">
                <div class="card-image">
                    <img src="${song.image}" alt="${song.title}">
                    <div class="card-overlay">
                        <button class="card-play-btn"><i class="fas fa-play"></i></button>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn like-btn ${this.likedSongs.has(originalIndex) ? 'liked' : ''}" data-song-index="${originalIndex}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="action-btn more-btn" data-song-index="${originalIndex}">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </div>
                <div class="card-content">
                    <h3>${song.title}</h3>
                    <p>${song.artist}</p>
                </div>
            </div>
        `}).join('');
    }

    renderArtistGrid() {
        const container = document.getElementById('popular-artists-grid');
        const artists = [...new Set(this.songs.map(s => s.artist))].slice(0, 5);
        container.innerHTML = artists.map(artist => {
            const song = this.songs.find(s => s.artist === artist);
            return `
            <div class="artist-card">
                <div class="artist-image">
                    <img src="${song.image}" alt="${artist}">
                    <button class="artist-play-btn"><i class="fas fa-play"></i></button>
                </div>
                <div class="artist-info">
                    <h3>${artist}</h3>
                    <p>Artist</p>
                </div>
            </div>
        `}).join('');
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.style.display = 'none', 500);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.id === 'liked-songs-nav') {
                    this.switchSection('liked-songs');
                } else if(item.dataset.section) {
                    this.switchSection(item.dataset.section);
                }
            });
        });

        // Dynamic content event delegation
        document.querySelector('.main-content').addEventListener('click', e => {
            const card = e.target.closest('.music-card');
            if (card) {
                const songIndex = parseInt(card.dataset.songIndex);
                if (!isNaN(songIndex)) {
                    if (e.target.closest('.like-btn')) {
                        this.toggleLike(songIndex);
                    } else if(e.target.closest('.more-btn')) {
                         e.stopPropagation();
                        this.showContextMenu(e, songIndex);
                    } else {
                        this.playSong(songIndex);
                    }
                }
            }
        });

        // Player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('prev-btn').addEventListener('click', () => this.previousSong());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSong());
        document.getElementById('shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('repeat-btn').addEventListener('click', () => this.toggleRepeat());
        document.getElementById('player-heart').addEventListener('click', () => this.toggleLike(this.currentSongIndex));
        
        // Progress and Volume bars
        this.setupProgressBar(document.getElementById('progress-bar'), (percent) => this.setProgress(percent));
        this.setupProgressBar(document.getElementById('volume-slider'), (percent) => this.setVolume(percent));
        document.getElementById('volume-btn').addEventListener('click', () => this.toggleMute());

        // Search
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        searchInput.addEventListener('input', e => {
            this.handleSearch(e.target.value);
            searchClear.classList.toggle('show', e.target.value.length > 0);
        });
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.handleSearch('');
            searchClear.classList.remove('show');
        });

        // Library tabs
        document.querySelectorAll('.lib-tab').forEach(tab => tab.addEventListener('click', (e) => this.switchLibraryTab(e.target)));
        document.querySelectorAll('.category-card').forEach(card => card.addEventListener('click', () => this.searchByCategory(card.dataset.category)));

        // History navigation
        document.getElementById('back-btn').addEventListener('click', () => this.goBack());
        document.getElementById('forward-btn').addEventListener('click', () => this.goForward());

        // Create Playlist
        document.getElementById('create-playlist').addEventListener('click', () => this.createNewPlaylist());
        
        // Audio player events
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.handleSongEnd());
        this.audioPlayer.addEventListener('play', () => { this.isPlaying = true; this.updatePlayPauseButton(); });
        this.audioPlayer.addEventListener('pause', () => { this.isPlaying = false; this.updatePlayPauseButton(); });

        // Context Menu
        document.addEventListener('click', () => this.hideContextMenu());
        document.getElementById('context-menu').addEventListener('click', e => {
            e.stopPropagation();
            const action = e.target.closest('.context-item').dataset.action;
            this.handleContextMenuAction(action);
            this.hideContextMenu();
        });

        // Player Display (Fullscreen)
        document.getElementById('fullscreen-btn').addEventListener('click', () => this.showPlayerDisplay());
        document.getElementById('player-image-container').addEventListener('click', () => this.showPlayerDisplay());
        document.getElementById('player-display-close').addEventListener('click', () => this.hidePlayerDisplay());
        
        // Display Controls
        document.getElementById('display-play-pause-btn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('display-prev-btn').addEventListener('click', () => this.previousSong());
        document.getElementById('display-next-btn').addEventListener('click', () => this.nextSong());
        document.getElementById('display-shuffle-btn').addEventListener('click', () => this.toggleShuffle());
        document.getElementById('display-repeat-btn').addEventListener('click', () => this.toggleRepeat());
        this.setupProgressBar(document.getElementById('display-progress-bar'), (percent) => this.setProgress(percent));
    }

    setupProgressBar(bar, action) {
        bar.addEventListener('click', e => {
            const rect = bar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            action(percent);
        });
    }

    initializeQueue() {
        this.originalQueue = [...Array(this.songs.length).keys()];
        this.queue = [...this.originalQueue];
    }

    updateGreeting() {
        const hour = new Date().getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        document.getElementById('greeting-text').textContent = greeting;
    }
    
    switchSection(section) {
        if (section === this.currentSection) return;
        
        this.addToHistory(this.currentSection);
        this.currentSection = section;

        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const activeNavItem = document.querySelector(`[data-section="${section}"]`) || (section === 'liked-songs' && document.getElementById('liked-songs-nav'));
        if(activeNavItem) activeNavItem.classList.add('active');

        document.querySelectorAll('.content-section').forEach(content => content.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');

        document.getElementById('search-container').classList.toggle('show', section === 'search');
        if (section === 'search') document.getElementById('search-input').focus();
        
        if (section === 'library') this.renderLibrary();
        if (section === 'liked-songs') this.renderLikedSongs();
    }

    playSong(songIndex) {
        if (songIndex === null || songIndex < 0 || songIndex >= this.songs.length) return;

        this.currentSongIndex = songIndex;
        const song = this.songs[songIndex];
        
        this.audioPlayer.src = song.url;
        this.audioPlayer.load();
        
        this.audioPlayer.play().catch(error => console.error("Playback failed:", error));
        
        this.isPlaying = true;
        this.updatePlayerInfo();
        this.updatePlayPauseButton();
    }

    togglePlayPause() {
        if (this.currentSongIndex === null) {
            this.playSong(this.queue[0] || 0);
            return;
        }
        if (this.isPlaying) this.audioPlayer.pause();
        else this.audioPlayer.play();
    }

    updatePlayPauseButton() {
        const iconClass = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        document.getElementById('play-pause-btn').querySelector('i').className = iconClass;
        document.getElementById('display-play-pause-btn').querySelector('i').className = iconClass;
        document.querySelector('.track-animation').classList.toggle('playing', this.isPlaying);
    }
    
    changeSong(direction) {
        if (this.queue.length === 0) return;
        const currentQueueIndex = this.queue.indexOf(this.currentSongIndex);
        let nextQueueIndex;

        if(direction === 'next') {
            nextQueueIndex = currentQueueIndex + 1;
            if (nextQueueIndex >= this.queue.length) {
                if (this.repeatMode === 1) nextQueueIndex = 0;
                else { this.isPlaying = false; this.updatePlayPauseButton(); return; }
            }
        } else { // prev
             if (this.audioPlayer.currentTime > 3) {
                this.audioPlayer.currentTime = 0;
                return;
            }
            nextQueueIndex = currentQueueIndex - 1;
            if (nextQueueIndex < 0) {
                 if (this.repeatMode === 1) nextQueueIndex = this.queue.length - 1;
                 else { this.audioPlayer.currentTime = 0; return; }
            }
        }
        this.playSong(this.queue[nextQueueIndex]);
    }

    previousSong() { this.changeSong('prev'); }
    nextSong() { this.changeSong('next'); }
    
    handleSongEnd() {
        if (this.repeatMode === 2) {
            this.playSong(this.currentSongIndex);
        } else {
            this.nextSong();
        }
    }

    updatePlayerInfo() {
        const song = this.songs[this.currentSongIndex];
        if (!song) {
            document.getElementById('player-image').src = 'https://placehold.co/80x80/121212/1db954?text=Musify';
            document.getElementById('player-title').textContent = 'Welcome to Musify';
            document.getElementById('player-artist').textContent = 'Select a song to play';
            document.getElementById('total-time').textContent = '0:00';
            document.getElementById('player-heart').classList.remove('liked');
            return;
        };
        
        document.getElementById('player-image').src = song.image;
        document.getElementById('player-title').textContent = song.title;
        document.getElementById('player-artist').textContent = song.artist;
        document.getElementById('total-time').textContent = this.formatTime(song.duration);
        document.getElementById('player-heart').classList.toggle('liked', this.likedSongs.has(this.currentSongIndex));

        this.updatePlayerDisplayInfo();
    }

    updatePlayerDisplayInfo() {
        const song = this.songs[this.currentSongIndex];
        if (!song) return;
    
        document.getElementById('display-art-image').src = song.image;
        document.getElementById('display-background').style.backgroundImage = `url(${song.image})`;
        document.getElementById('display-title').textContent = song.title;
        document.getElementById('display-artist').textContent = song.artist;
        document.getElementById('display-total-time').textContent = this.formatTime(song.duration);
    }
    
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        document.getElementById('shuffle-btn').classList.toggle('active', this.isShuffled);
        document.getElementById('display-shuffle-btn').classList.toggle('active', this.isShuffled);
        
        if (this.isShuffled) {
            this.shuffleQueue();
        } else {
            const currentSong = this.queue[0];
            this.queue = [...this.originalQueue];
            // keep current song at top
            this.queue.splice(this.queue.indexOf(currentSong), 1);
            this.queue.unshift(currentSong);
        }
    }

    shuffleQueue() {
        const currentSong = this.queue[0];
        let restOfQueue = this.queue.slice(1);

        for (let i = restOfQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [restOfQueue[i], restOfQueue[j]] = [restOfQueue[j], restOfQueue[i]];
        }
        this.queue = [currentSong, ...restOfQueue];
    }
    
    toggleRepeat() {
        this.repeatMode = (this.repeatMode + 1) % 3;
        const mainBtn = document.getElementById('repeat-btn');
        const displayBtn = document.getElementById('display-repeat-btn');
        const mainIcon = mainBtn.querySelector('i');
        const displayIcon = displayBtn.querySelector('i');
        
        mainBtn.classList.toggle('active', this.repeatMode > 0);
        displayBtn.classList.toggle('active', this.repeatMode > 0);

        const iconClass = this.repeatMode === 2 ? 'fas fa-redo-alt' : 'fas fa-redo';
        mainIcon.className = iconClass;
        displayIcon.className = iconClass;

        if (this.repeatMode === 2) {
          mainIcon.classList.add('fa-1');
          displayIcon.classList.add('fa-1');
        }
    }

    setProgress(percent) {
        if(this.currentSongIndex === null) return;
        const song = this.songs[this.currentSongIndex];
        this.audioPlayer.currentTime = percent * song.duration;
    }
    
    updateDuration() {
         const song = this.songs[this.currentSongIndex];
         if(song) {
            const formattedTime = this.formatTime(song.duration);
            document.getElementById('total-time').textContent = formattedTime;
            document.getElementById('display-total-time').textContent = formattedTime;
         }
    }
    
    updateProgress() {
        const song = this.songs[this.currentSongIndex];
        if (!song || !this.audioPlayer.currentTime) return;

        const percent = (this.audioPlayer.currentTime / song.duration) * 100;
        const currentTimeFormatted = this.formatTime(this.audioPlayer.currentTime);

        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('current-time').textContent = currentTimeFormatted;
        
        document.getElementById('display-progress-fill').style.width = `${percent}%`;
        document.getElementById('display-current-time').textContent = currentTimeFormatted;
    }

    setVolume(percent) {
        this.volume = Math.max(0, Math.min(1, percent));
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }
    
    updateVolumeDisplay() {
        document.getElementById('volume-fill').style.width = `${this.volume * 100}%`;
        const icon = document.getElementById('volume-btn').querySelector('i');
        if (this.volume === 0) icon.className = 'fas fa-volume-mute';
        else if (this.volume < 0.5) icon.className = 'fas fa-volume-down';
        else icon.className = 'fas fa-volume-up';
    }

    toggleMute() {
        if (this.volume > 0) {
            this.previousVolume = this.volume;
            this.volume = 0;
        } else {
            this.volume = this.previousVolume;
        }
        this.audioPlayer.volume = this.volume;
        this.updateVolumeDisplay();
    }

    toggleLike(songIndex) {
        if (songIndex === null) return;
        if (this.likedSongs.has(songIndex)) {
            this.likedSongs.delete(songIndex);
            this.showNotification('Removed from Liked Songs');
        } else {
            this.likedSongs.add(songIndex);
            this.showNotification('Added to Liked Songs');
        }
        
        if (songIndex === this.currentSongIndex) {
            document.getElementById('player-heart').classList.toggle('liked', this.likedSongs.has(songIndex));
        }

        const cardLikeBtn = document.querySelector(`.like-btn[data-song-index="${songIndex}"]`);
        if(cardLikeBtn) cardLikeBtn.classList.toggle('liked', this.likedSongs.has(songIndex));

        if(this.currentSection === 'liked-songs') this.renderLikedSongs();
    }

    handleSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        const defaultView = document.getElementById('search-default-view');
        
        if (query.trim() === '') {
            resultsContainer.style.display = 'none';
            defaultView.style.display = 'block';
            return;
        }

        resultsContainer.style.display = 'block';
        defaultView.style.display = 'none';
        
        const filtered = this.songs.filter(s => 
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderCardGrid('results-grid', filtered);
    }

    searchByCategory(category) {
        document.getElementById('search-input').value = category;
        this.handleSearch(category);
    }

    switchLibraryTab(selectedTab) {
        document.querySelectorAll('.lib-tab').forEach(tab => tab.classList.remove('active'));
        selectedTab.classList.add('active');
        this.renderLibrary(selectedTab.dataset.tab);
    }

    renderLibrary(tab = 'playlists') {
        const list = document.getElementById('library-list');
        let content = '';
        if(tab === 'playlists') {
            content = this.playlists.map(p => `
                <div class="library-item">
                    <img src="${this.songs[p.songs[0]].image}" alt="${p.name}">
                    <div class="library-info">
                        <h4>${p.name}</h4>
                        <p>Playlist • ${p.songs.length} songs</p>
                    </div>
                    <div class="library-item-actions">
                        <button class="library-action-btn"><i class="fas fa-play"></i></button>
                    </div>
                </div>
            `).join('');
        } // Add artists and albums logic here
        list.innerHTML = content;
    }
    
    renderLikedSongs() {
        const list = document.getElementById('liked-songs-list');
        const countEl = document.getElementById('liked-songs-count');
        const likedArray = Array.from(this.likedSongs);
        
        countEl.textContent = likedArray.length;
        
        if(likedArray.length === 0) {
            list.innerHTML = `<p style="padding: 20px;">You have no liked songs yet.</p>`;
            return;
        }

        list.innerHTML = likedArray.map((songIndex, i) => {
            const song = this.songs[songIndex];
            return `
            <div class="song-list-item" data-song-index="${songIndex}">
                <div class="song-index">${i + 1}</div>
                <div class="song-title-info">
                    <img src="${song.image}" alt="${song.title}">
                    <div class="song-title-details">
                        <div class="song-title">${song.title}</div>
                        <div class="song-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="song-album">${song.album}</div>
                <div class="song-date-added">A while ago</div>
                <div class="song-duration">${this.formatTime(song.duration)}</div>
            </div>
            `
        }).join('');
        
        list.querySelectorAll('.song-list-item').forEach(item => {
            item.addEventListener('click', e => {
                 this.queue = likedArray;
                 this.playSong(parseInt(e.currentTarget.dataset.songIndex));
            });
        });
    }


    createNewPlaylist() {
        const name = prompt('Enter playlist name:');
        if (name && name.trim()) {
            this.playlists.push({ name: name.trim(), songs: [], icon: 'fas fa-music' });
            this.renderPlaylists();
            this.showNotification(`Created playlist: ${name}`);
        }
    }

    renderPlaylists() {
        const container = document.querySelector('.playlists');
        container.innerHTML = this.playlists.map((p, index) => `
            <div class="playlist-item" data-playlist-index="${index}">
                <i class="${p.icon}"></i> ${p.name}
            </div>
        `).join('');

        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', e => {
                const playlistIndex = parseInt(e.currentTarget.dataset.playlistIndex);
                this.playPlaylist(playlistIndex);
            });
        });
    }

    playPlaylist(playlistIndex) {
        const playlist = this.playlists[playlistIndex];
        if (playlist && playlist.songs.length > 0) {
            this.queue = [...playlist.songs];
            this.playSong(this.queue[0]);
            this.showNotification(`Playing ${playlist.name}`);
        }
    }

    showContextMenu(e, songIndex) {
        e.preventDefault();
        const contextMenu = document.getElementById('context-menu');
        this.contextMenuSongIndex = songIndex;

        const likeItem = contextMenu.querySelector('[data-action="like"]');
        if(this.likedSongs.has(songIndex)) {
            likeItem.innerHTML = `<i class="fas fa-heart"></i> Unlike`;
        } else {
            likeItem.innerHTML = `<i class="far fa-heart"></i> Like`;
        }

        const { clientX, clientY } = e;
        contextMenu.style.left = `${clientX}px`;
        contextMenu.style.top = `${clientY}px`;
        contextMenu.classList.add('show');
    }

    hideContextMenu() {
        document.getElementById('context-menu').classList.remove('show');
    }

    handleContextMenuAction(action) {
        const songIndex = this.contextMenuSongIndex;
        if(songIndex === null) return;

        switch(action) {
            case 'play':
                this.playSong(songIndex);
                break;
            case 'add-to-queue':
                this.queue.push(songIndex);
                this.showNotification('Added to queue');
                break;
            case 'like':
                this.toggleLike(songIndex);
                break;
            // Add other cases here
        }
    }

    addToHistory(section) {
        if(this.history.past[this.history.past.length - 1] !== section) {
            this.history.past.push(section);
        }
        this.history.future = []; // Clear future history on new action
        this.updateNavButtons();
    }

    goBack() {
        if (this.history.past.length > 1) {
            const current = this.history.past.pop();
            this.history.future.unshift(current);
            const prev = this.history.past[this.history.past.length-1];
            this.currentSection = prev; // Update current section without adding to history
            this.switchSection(prev);
            this.history.past.pop(); // remove duplicate
        }
        this.updateNavButtons();
    }

    goForward() {
        if (this.history.future.length > 0) {
            const next = this.history.future.shift();
            this.switchSection(next);
        }
        this.updateNavButtons();
    }
    
    updateNavButtons() {
        document.getElementById('back-btn').disabled = this.history.past.length <= 1;
        document.getElementById('forward-btn').disabled = this.history.future.length === 0;
    }


    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showPlayerDisplay() {
        if (this.currentSongIndex === null) return;
        this.playerDisplay.classList.add('show');
    }

    hidePlayerDisplay() {
        this.playerDisplay.classList.remove('show');
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MusifyApp();
});

// Add CSS for notification
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: var(--background-lighter);
        color: var(--text-primary);
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 8px 24px var(--shadow-heavy);
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }
    .notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    .control-btn i.fa-1::after {
        content: '1';
        position: absolute;
        font-size: 8px;
        font-weight: bold;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--primary-green);
    }
`;
document.head.appendChild(style);

