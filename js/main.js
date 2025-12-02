// ============================================
// EVENT MANAGEMENT APPLICATION
// ============================================

class EventManager {
    constructor() {
        this.sessions = [];
        this.attendees = [];
        this.speakers = [];
        this.rooms = [];
        this.currentView = 'timeline';
        this.filters = {
            search: '',
            room: '',
            attendee: '',
            time: ''
        };
        this.notificationsEnabled = false;
        this.editingSessionId = null;
        this.editingAttendeeId = null;
        this.editingSpeakerId = null;
        this.editingRoomId = null;
        this.favorites = new Set();

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.checkNotificationPermission();
        this.checkSetupState();
        this.render();
        this.updateStats();
        this.populateFilters();
    }

    // ============================================
    // STORAGE MANAGEMENT
    // ============================================
    saveToStorage() {
        localStorage.setItem('copado_events_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('copado_events_attendees', JSON.stringify(this.attendees));
        localStorage.setItem('copado_events_speakers', JSON.stringify(this.speakers));
        localStorage.setItem('copado_events_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('copado_events_favorites', JSON.stringify([...this.favorites]));
    }

    loadFromStorage() {
        const sessions = localStorage.getItem('copado_events_sessions');
        const attendees = localStorage.getItem('copado_events_attendees');
        const speakers = localStorage.getItem('copado_events_speakers');
        const rooms = localStorage.getItem('copado_events_rooms');
        const favorites = localStorage.getItem('copado_events_favorites');

        if (sessions) this.sessions = JSON.parse(sessions);
        if (attendees) this.attendees = JSON.parse(attendees);
        if (speakers) this.speakers = JSON.parse(speakers);
        if (rooms) this.rooms = JSON.parse(rooms);
        if (favorites) this.favorites = new Set(JSON.parse(favorites));
    }

    // ============================================
    // SETUP STATE MANAGEMENT
    // ============================================
    checkSetupState() {
        const setupGuide = document.getElementById('setupGuide');
        const sessionsContainer = document.getElementById('sessionsContainer');
        const emptyState = document.getElementById('emptyState');

        // Show setup guide if no data exists
        if (this.sessions.length === 0 &&
            this.attendees.length === 0 &&
            this.speakers.length === 0 &&
            this.rooms.length === 0) {
            setupGuide.classList.remove('hidden');
            sessionsContainer.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            setupGuide.classList.add('hidden');
            sessionsContainer.classList.remove('hidden');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
        // Setup guide
        document.getElementById('startSetup')?.addEventListener('click', () => {
            this.openManagementModal('attendees');
        });

        // Management button
        document.getElementById('manageDataBtn').addEventListener('click', () => {
            this.openManagementModal('attendees');
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.render();
            this.toggleClearButton();
        });

        // Clear search
        document.getElementById('clearSearch').addEventListener('click', () => {
            searchInput.value = '';
            this.filters.search = '';
            this.render();
            this.toggleClearButton();
        });

        // Filters
        document.getElementById('roomFilter').addEventListener('change', (e) => {
            this.filters.room = e.target.value;
            this.render();
        });

        document.getElementById('attendeeFilter').addEventListener('change', (e) => {
            this.filters.attendee = e.target.value;
            this.render();
        });

        document.getElementById('timeFilter').addEventListener('change', (e) => {
            this.filters.time = e.target.value;
            this.render();
        });

        // Reset filters
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Add session button
        document.getElementById('addSessionBtn').addEventListener('click', () => {
            this.openAddSessionModal();
        });

        // Notification toggle
        document.getElementById('notificationToggle').addEventListener('click', () => {
            this.showNotificationStatus();
        });

        // Notification banner
        document.getElementById('enableNotifications')?.addEventListener('click', () => {
            this.requestNotificationPermission();
        });

        document.getElementById('dismissBanner')?.addEventListener('click', () => {
            this.hideNotificationBanner();
        });

        // Management tabs
        document.querySelectorAll('.management-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchManagementTab(tabName);
            });
        });

        // Attendee form
        document.getElementById('attendeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAttendee();
        });

        // Speaker form
        document.getElementById('speakerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSpeaker();
        });

        // Room form
        document.getElementById('roomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRoom();
        });

        // Edit forms
        document.getElementById('editAttendeeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAttendeeEdit();
        });

        document.getElementById('editSpeakerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSpeakerEdit();
        });

        document.getElementById('editRoomForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRoomEdit();
        });

        // Cancel edit buttons
        document.getElementById('cancelEditAttendee').addEventListener('click', () => {
            this.closeModal('editAttendeeModal');
        });

        document.getElementById('cancelEditSpeaker').addEventListener('click', () => {
            this.closeModal('editSpeakerModal');
        });

        document.getElementById('cancelEditRoom').addEventListener('click', () => {
            this.closeModal('editRoomModal');
        });

        // Session form
        document.getElementById('sessionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSession();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal('editModal');
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target === el) {
                    this.closeAllModals();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    toggleClearButton() {
        const clearBtn = document.getElementById('clearSearch');
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    // ============================================
    // MANAGEMENT MODAL
    // ============================================
    openManagementModal(tab = 'attendees') {
        this.switchManagementTab(tab);
        this.renderManagementLists();
        this.openModal('managementModal');
    }

    switchManagementTab(tabName) {
        // Update tabs
        document.querySelectorAll('.management-tab').forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update content
        document.querySelectorAll('.management-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        this.renderManagementLists();
    }

    renderManagementLists() {
        this.renderAttendeesList();
        this.renderSpeakersList();
        this.renderRoomsList();
    }

    // ============================================
    // ATTENDEE MANAGEMENT
    // ============================================
    addAttendee() {
        const name = document.getElementById('attendeeName').value.trim();
        const email = document.getElementById('attendeeEmail').value.trim();

        if (!name || !email) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const newAttendee = {
            id: Date.now(),
            name,
            email
        };

        this.attendees.push(newAttendee);
        this.saveToStorage();
        this.renderAttendeesList();
        this.populateFilters();
        this.checkSetupState();
        document.getElementById('attendeeForm').reset();
        this.showToast('Attendee added successfully', 'success');
    }

    renderAttendeesList() {
        const container = document.getElementById('attendeesList');

        if (this.attendees.length === 0) {
            container.innerHTML = '<div class="empty-list-message">No attendees yet. Add your first attendee above.</div>';
            return;
        }

        container.innerHTML = this.attendees.map(attendee => `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-name">${attendee.name}</div>
                    <div class="item-detail">${attendee.email}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-ghost" onclick="window.eventManager.editAttendee(${attendee.id})">Edit</button>
                    <button class="btn btn-ghost" onclick="window.eventManager.deleteAttendee(${attendee.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editAttendee(id) {
        const attendee = this.attendees.find(a => a.id === id);
        if (!attendee) return;

        this.editingAttendeeId = id;
        document.getElementById('editAttendeeName').value = attendee.name;
        document.getElementById('editAttendeeEmail').value = attendee.email;
        this.openModal('editAttendeeModal');
    }

    saveAttendeeEdit() {
        const attendee = this.attendees.find(a => a.id === this.editingAttendeeId);
        if (!attendee) return;

        attendee.name = document.getElementById('editAttendeeName').value.trim();
        attendee.email = document.getElementById('editAttendeeEmail').value.trim();

        this.saveToStorage();
        this.renderAttendeesList();
        this.populateFilters();
        this.render();
        this.closeModal('editAttendeeModal');
        this.showToast('Attendee updated successfully', 'success');
    }

    deleteAttendee(id) {
        const attendee = this.attendees.find(a => a.id === id);
        if (!attendee) return;

        // Check if attendee is used in any session
        const usedInSessions = this.sessions.filter(s => s.attendees.includes(id));
        if (usedInSessions.length > 0) {
            this.showToast('Cannot delete attendee assigned to sessions', 'error');
            return;
        }

        if (confirm(`Delete ${attendee.name}?`)) {
            this.attendees = this.attendees.filter(a => a.id !== id);
            this.saveToStorage();
            this.renderAttendeesList();
            this.populateFilters();
            this.checkSetupState();
            this.showToast('Attendee deleted', 'success');
        }
    }

    // ============================================
    // SPEAKER MANAGEMENT
    // ============================================
    addSpeaker() {
        const name = document.getElementById('speakerName').value.trim();
        const title = document.getElementById('speakerTitle').value.trim();
        const bio = document.getElementById('speakerBio').value.trim();

        if (!name || !title) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        const newSpeaker = {
            id: Date.now(),
            name,
            title,
            bio
        };

        this.speakers.push(newSpeaker);
        this.saveToStorage();
        this.renderSpeakersList();
        this.populateSpeakersDropdown();
        this.checkSetupState();
        document.getElementById('speakerForm').reset();
        this.showToast('Speaker added successfully', 'success');
    }

    renderSpeakersList() {
        const container = document.getElementById('speakersList');

        if (this.speakers.length === 0) {
            container.innerHTML = '<div class="empty-list-message">No speakers yet. Add your first speaker above.</div>';
            return;
        }

        container.innerHTML = this.speakers.map(speaker => `
            <div class="item-card">
                <div class="item-info">
                    <div class="item-name">${speaker.name}</div>
                    <div class="item-detail"><span class="item-detail-label">Title:</span> ${speaker.title}</div>
                    ${speaker.bio ? `<div class="item-detail">${speaker.bio}</div>` : ''}
                </div>
                <div class="item-actions">
                    <button class="btn btn-ghost" onclick="window.eventManager.editSpeaker(${speaker.id})">Edit</button>
                    <button class="btn btn-ghost" onclick="window.eventManager.deleteSpeaker(${speaker.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editSpeaker(id) {
        const speaker = this.speakers.find(s => s.id === id);
        if (!speaker) return;

        this.editingSpeakerId = id;
        document.getElementById('editSpeakerName').value = speaker.name;
        document.getElementById('editSpeakerTitle').value = speaker.title;
        document.getElementById('editSpeakerBio').value = speaker.bio || '';
        this.openModal('editSpeakerModal');
    }

    saveSpeakerEdit() {
        const speaker = this.speakers.find(s => s.id === this.editingSpeakerId);
        if (!speaker) return;

        speaker.name = document.getElementById('editSpeakerName').value.trim();
        speaker.title = document.getElementById('editSpeakerTitle').value.trim();
        speaker.bio = document.getElementById('editSpeakerBio').value.trim();

        this.saveToStorage();
        this.renderSpeakersList();
        this.populateSpeakersDropdown();
        this.render();
        this.closeModal('editSpeakerModal');
        this.showToast('Speaker updated successfully', 'success');
    }

    deleteSpeaker(id) {
        const speaker = this.speakers.find(s => s.id === id);
        if (!speaker) return;

        // Check if speaker is used in any session
        const usedInSessions = this.sessions.filter(s => s.speakerId === id);
        if (usedInSessions.length > 0) {
            this.showToast('Cannot delete speaker assigned to sessions', 'error');
            return;
        }

        if (confirm(`Delete ${speaker.name}?`)) {
            this.speakers = this.speakers.filter(s => s.id !== id);
            this.saveToStorage();
            this.renderSpeakersList();
            this.populateSpeakersDropdown();
            this.checkSetupState();
            this.showToast('Speaker deleted', 'success');
        }
    }

    // ============================================
    // ROOM MANAGEMENT
    // ============================================
    addRoom() {
        const name = document.getElementById('roomName').value.trim();
        const color = document.getElementById('roomColor').value;

        if (!name || !color) {
            this.showToast('Please fill in all fields', 'error');
            return;
        }

        const newRoom = {
            id: Date.now(),
            name,
            color
        };

        this.rooms.push(newRoom);
        this.saveToStorage();
        this.renderRoomsList();
        this.populateFilters();
        this.populateRoomsDropdown();
        this.checkSetupState();
        document.getElementById('roomForm').reset();
        this.showToast('Room added successfully', 'success');
    }

    renderRoomsList() {
        const container = document.getElementById('roomsList');

        if (this.rooms.length === 0) {
            container.innerHTML = '<div class="empty-list-message">No rooms yet. Add your first room above.</div>';
            return;
        }

        container.innerHTML = this.rooms.map(room => `
            <div class="item-card">
                <div class="room-color-indicator ${room.color}"></div>
                <div class="item-info">
                    <div class="item-name">${room.name}</div>
                    <div class="item-detail"><span class="item-detail-label">Color:</span> ${this.getColorName(room.color)}</div>
                </div>
                <div class="item-actions">
                    <button class="btn btn-ghost" onclick="window.eventManager.editRoom(${room.id})">Edit</button>
                    <button class="btn btn-ghost" onclick="window.eventManager.deleteRoom(${room.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    editRoom(id) {
        const room = this.rooms.find(r => r.id === id);
        if (!room) return;

        this.editingRoomId = id;
        document.getElementById('editRoomName').value = room.name;
        document.getElementById('editRoomColor').value = room.color;
        this.openModal('editRoomModal');
    }

    saveRoomEdit() {
        const room = this.rooms.find(r => r.id === this.editingRoomId);
        if (!room) return;

        room.name = document.getElementById('editRoomName').value.trim();
        room.color = document.getElementById('editRoomColor').value;

        this.saveToStorage();
        this.renderRoomsList();
        this.populateFilters();
        this.populateRoomsDropdown();
        this.render();
        this.closeModal('editRoomModal');
        this.showToast('Room updated successfully', 'success');
    }

    deleteRoom(id) {
        const room = this.rooms.find(r => r.id === id);
        if (!room) return;

        // Check if room is used in any session
        const usedInSessions = this.sessions.filter(s => s.roomId === id);
        if (usedInSessions.length > 0) {
            this.showToast('Cannot delete room assigned to sessions', 'error');
            return;
        }

        if (confirm(`Delete ${room.name}?`)) {
            this.rooms = this.rooms.filter(r => r.id !== id);
            this.saveToStorage();
            this.renderRoomsList();
            this.populateFilters();
            this.populateRoomsDropdown();
            this.checkSetupState();
            this.updateStats();
            this.showToast('Room deleted', 'success');
        }
    }

    getColorName(colorClass) {
        const colorMap = {
            'room-1': 'Copado Blue',
            'room-2': 'Teal',
            'room-3': 'Orange',
            'room-4': 'Sky Blue'
        };
        return colorMap[colorClass] || colorClass;
    }

    // ============================================
    // NOTIFICATION MANAGEMENT
    // ============================================
    checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.notificationsEnabled = true;
                this.updateNotificationUI();
            } else if (Notification.permission === 'default') {
                this.showNotificationBanner();
            }
        }
    }

    showNotificationBanner() {
        const banner = document.getElementById('notificationBanner');
        if (banner) {
            banner.classList.remove('hidden');
        }
    }

    hideNotificationBanner() {
        const banner = document.getElementById('notificationBanner');
        if (banner) {
            banner.classList.add('hidden');
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.notificationsEnabled = true;
                this.updateNotificationUI();
                this.hideNotificationBanner();
                this.showToast('Notifications enabled! You\'ll receive alerts when sessions change.', 'success');

                // Send test notification
                new Notification('Copado Events Notifications', {
                    body: 'You\'ll now receive updates about session changes.',
                    icon: '🔔',
                    tag: 'copado-events-welcome'
                });
            } else {
                this.showToast('Notifications blocked. You can enable them in browser settings.', 'warning');
            }
        }
    }

    updateNotificationUI() {
        const toggle = document.getElementById('notificationToggle');
        if (this.notificationsEnabled) {
            toggle.classList.add('notifications-enabled');
            toggle.title = 'Notifications Enabled';
        } else {
            toggle.classList.remove('notifications-enabled');
            toggle.title = 'Notifications Disabled';
        }
    }

    showNotificationStatus() {
        if (this.notificationsEnabled) {
            this.showToast('Notifications are enabled. You\'ll receive alerts when sessions change.', 'info');
        } else {
            this.showToast('Notifications are disabled. Click to enable.', 'warning');
            setTimeout(() => this.requestNotificationPermission(), 1000);
        }
    }

    sendNotification(title, body, tag = 'copado-events-update') {
        if (this.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🔔',
                tag: tag,
                requireInteraction: false
            });
        }
    }

    // ============================================
    // FILTERING & SEARCH
    // ============================================
    getFilteredSessions() {
        return this.sessions.filter(session => {
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const speaker = this.speakers.find(s => s.id === session.speakerId);
                const speakerName = speaker ? speaker.name : '';

                const matchesSearch =
                    session.title.toLowerCase().includes(searchLower) ||
                    speakerName.toLowerCase().includes(searchLower) ||
                    session.description.toLowerCase().includes(searchLower) ||
                    session.tags.some(tag => tag.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;
            }

            // Room filter
            if (this.filters.room) {
                const roomId = parseInt(this.filters.room);
                if (session.roomId !== roomId) {
                    return false;
                }
            }

            // Attendee filter
            if (this.filters.attendee) {
                const attendeeId = parseInt(this.filters.attendee);
                if (!session.attendees.includes(attendeeId)) {
                    return false;
                }
            }

            // Time filter
            if (this.filters.time) {
                const startHour = parseInt(session.startTime.split(':')[0]);
                if (this.filters.time === 'morning' && startHour >= 12) return false;
                if (this.filters.time === 'afternoon' && (startHour < 12 || startHour >= 17)) return false;
                if (this.filters.time === 'evening' && startHour < 17) return false;
            }

            return true;
        });
    }

    resetFilters() {
        this.filters = {
            search: '',
            room: '',
            attendee: '',
            time: ''
        };

        document.getElementById('searchInput').value = '';
        document.getElementById('roomFilter').value = '';
        document.getElementById('attendeeFilter').value = '';
        document.getElementById('timeFilter').value = '';

        this.toggleClearButton();
        this.render();
        this.showToast('Filters reset', 'info');
    }

    populateFilters() {
        // Populate room filter
        const roomFilter = document.getElementById('roomFilter');
        const currentRoomValue = roomFilter.value;
        roomFilter.innerHTML = '<option value="">All Rooms</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomFilter.appendChild(option);
        });
        roomFilter.value = currentRoomValue;

        // Populate attendee filter
        const attendeeFilter = document.getElementById('attendeeFilter');
        const currentAttendeeValue = attendeeFilter.value;
        attendeeFilter.innerHTML = '<option value="">All Attendees</option>';
        this.attendees.forEach(attendee => {
            const option = document.createElement('option');
            option.value = attendee.id;
            option.textContent = attendee.name;
            attendeeFilter.appendChild(option);
        });
        attendeeFilter.value = currentAttendeeValue;
    }

    populateSpeakersDropdown() {
        const speakerSelect = document.getElementById('sessionSpeaker');
        const currentValue = speakerSelect.value;
        speakerSelect.innerHTML = '<option value="">Select Speaker</option>';
        this.speakers.forEach(speaker => {
            const option = document.createElement('option');
            option.value = speaker.id;
            option.textContent = `${speaker.name} - ${speaker.title}`;
            speakerSelect.appendChild(option);
        });
        speakerSelect.value = currentValue;
    }

    populateRoomsDropdown() {
        const roomSelect = document.getElementById('sessionRoom');
        const currentValue = roomSelect.value;
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = room.name;
            roomSelect.appendChild(option);
        });
        roomSelect.value = currentValue;
    }

    // ============================================
    // VIEW MANAGEMENT
    // ============================================
    switchView(view) {
        this.currentView = view;

        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });

        // Update container class
        const container = document.getElementById('sessionsContainer');
        container.className = `sessions-container ${view}-view`;

        this.render();
    }

    // ============================================
    // RENDERING
    // ============================================
    render() {
        const filteredSessions = this.getFilteredSessions();
        const container = document.getElementById('sessionsContainer');
        const emptyState = document.getElementById('emptyState');

        if (filteredSessions.length === 0 && this.sessions.length > 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        if (filteredSessions.length === 0) {
            container.innerHTML = '';
            emptyState.classList.add('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Sort sessions by date and time
        filteredSessions.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.startTime}`);
            const dateB = new Date(`${b.date} ${b.startTime}`);
            return dateA - dateB;
        });

        container.innerHTML = filteredSessions.map(session => this.renderSessionCard(session)).join('');

        // Add event listeners to session cards
        this.attachSessionCardListeners();
    }

    renderSessionCard(session) {
        const room = this.rooms.find(r => r.id === session.roomId);
        const roomClass = room ? room.color : '';
        const roomName = room ? room.name : 'Unknown Room';

        const speaker = this.speakers.find(s => s.id === session.speakerId);
        const speakerName = speaker ? `${speaker.name} - ${speaker.title}` : 'Unknown Speaker';

        const isFavorite = this.favorites.has(session.id);
        const favoriteClass = isFavorite ? 'active' : '';
        const updatedClass = session.lastUpdated ? 'updated' : '';
        const favoriteCardClass = isFavorite ? 'favorite' : '';

        const attendeeNames = session.attendees
            .map(id => {
                const attendee = this.attendees.find(a => a.id === id);
                return attendee ? attendee.name : '';
            })
            .filter(name => name);

        const updateIndicator = session.lastUpdated
            ? `<span class="update-indicator">
                <span>🔄</span> Updated ${this.getRelativeTime(session.lastUpdated)}
               </span>`
            : '';

        return `
            <div class="session-card ${roomClass} ${updatedClass} ${favoriteCardClass}" data-session-id="${session.id}">
                <div class="session-header">
                    <div class="session-time">
                        <div class="session-date">${this.formatDate(session.date)}</div>
                        <div class="session-time-range">${session.startTime} - ${session.endTime}</div>
                    </div>
                    <div class="session-main">
                        <div class="session-title-row">
                            <h3 class="session-title">${session.title}</h3>
                            <div class="session-actions">
                                <button class="action-btn favorite-btn ${favoriteClass}" data-action="favorite" title="Favorite">
                                    ${isFavorite ? '❤️' : '🤍'}
                                </button>
                                <button class="action-btn" data-action="edit" title="Edit">
                                    ✏️
                                </button>
                                <button class="action-btn" data-action="delete" title="Delete">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="session-speaker">${speakerName}</div>
                        <div class="session-meta">
                            <div class="meta-item">
                                <span class="meta-icon">📍</span>
                                <span class="room-badge ${roomClass}">${roomName}</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">⏱️</span>
                                ${this.getDuration(session.startTime, session.endTime)}
                            </div>
                            <div class="meta-item">
                                <span class="meta-icon">👥</span>
                                ${session.attendees.length} attendees
                            </div>
                            ${updateIndicator}
                        </div>
                        <div class="session-description">${this.truncateText(session.description, 150)}</div>
                        <div class="session-tags">
                            ${session.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        ${attendeeNames.length > 0 ? `
                        <div class="session-attendees">
                            <span class="attendees-label">Attending:</span>
                            <div class="attendees-list">
                                ${attendeeNames.slice(0, 5).map(name =>
                                    `<span class="attendee-chip">${name}</span>`
                                ).join('')}
                                ${attendeeNames.length > 5 ?
                                    `<span class="attendee-chip">+${attendeeNames.length - 5} more</span>`
                                    : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    attachSessionCardListeners() {
        // Click on card to view details
        document.querySelectorAll('.session-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking on action buttons
                if (e.target.closest('.session-actions')) return;

                const sessionId = parseInt(card.dataset.sessionId);
                this.showSessionDetails(sessionId);
            });
        });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const sessionId = parseInt(btn.closest('.session-card').dataset.sessionId);

                switch(action) {
                    case 'favorite':
                        this.toggleFavorite(sessionId);
                        break;
                    case 'edit':
                        this.openEditSessionModal(sessionId);
                        break;
                    case 'delete':
                        this.deleteSession(sessionId);
                        break;
                }
            });
        });
    }

    // ============================================
    // SESSION MANAGEMENT
    // ============================================
    showSessionDetails(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        const room = this.rooms.find(r => r.id === session.roomId);
        const roomClass = room ? room.color : '';
        const roomName = room ? room.name : 'Unknown Room';

        const speaker = this.speakers.find(s => s.id === session.speakerId);
        const speakerName = speaker ? `${speaker.name} - ${speaker.title}` : 'Unknown Speaker';

        const attendeeDetails = session.attendees
            .map(id => this.attendees.find(a => a.id === id))
            .filter(a => a);

        const modalContent = `
            <div class="modal-session-header">
                <h2 class="modal-session-title">${session.title}</h2>
                <div class="modal-session-speaker">By ${speakerName}</div>
                <div class="session-meta">
                    <span class="room-badge ${roomClass}">${roomName}</span>
                    ${session.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>

            <div class="modal-session-meta">
                <div class="modal-meta-item">
                    <div class="modal-meta-label">Date</div>
                    <div class="modal-meta-value">${this.formatDate(session.date)}</div>
                </div>
                <div class="modal-meta-item">
                    <div class="modal-meta-label">Time</div>
                    <div class="modal-meta-value">${session.startTime} - ${session.endTime}</div>
                </div>
                <div class="modal-meta-item">
                    <div class="modal-meta-label">Duration</div>
                    <div class="modal-meta-value">${this.getDuration(session.startTime, session.endTime)}</div>
                </div>
                <div class="modal-meta-item">
                    <div class="modal-meta-label">Attendees</div>
                    <div class="modal-meta-value">${session.attendees.length} people</div>
                </div>
            </div>

            <div class="modal-section">
                <h3 class="modal-section-title">Description</h3>
                <p class="modal-description">${session.description}</p>
            </div>

            ${attendeeDetails.length > 0 ? `
            <div class="modal-section">
                <h3 class="modal-section-title">Attendees</h3>
                <div class="modal-attendees-grid">
                    ${attendeeDetails.map(attendee => `
                        <div class="modal-attendee-card">
                            <div class="modal-attendee-name">${attendee.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;

        document.querySelector('#sessionModal .modal-body').innerHTML = modalContent;
        this.openModal('sessionModal');
    }

    openAddSessionModal() {
        // Check if basic data exists
        if (this.speakers.length === 0 || this.rooms.length === 0 || this.attendees.length === 0) {
            this.showToast('Please add speakers, rooms, and attendees first', 'warning');
            setTimeout(() => this.openManagementModal('attendees'), 1000);
            return;
        }

        this.editingSessionId = null;
        document.getElementById('editModalTitle').textContent = 'Add New Session';

        // Reset form
        document.getElementById('sessionForm').reset();

        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sessionDate').value = today;

        // Populate dropdowns
        this.populateSpeakersDropdown();
        this.populateRoomsDropdown();
        this.populateAttendeeCheckboxes([]);

        this.openModal('editModal');
    }

    openEditSessionModal(sessionId) {
        this.editingSessionId = sessionId;
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        document.getElementById('editModalTitle').textContent = 'Edit Session';

        // Populate form
        document.getElementById('sessionTitle').value = session.title;
        document.getElementById('sessionDate').value = session.date;
        document.getElementById('sessionStartTime').value = session.startTime;
        document.getElementById('sessionEndTime').value = session.endTime;
        document.getElementById('sessionDescription').value = session.description;
        document.getElementById('sessionTags').value = session.tags.join(', ');

        // Populate dropdowns
        this.populateSpeakersDropdown();
        this.populateRoomsDropdown();

        document.getElementById('sessionSpeaker').value = session.speakerId;
        document.getElementById('sessionRoom').value = session.roomId;

        // Populate attendee checkboxes
        this.populateAttendeeCheckboxes(session.attendees);

        this.openModal('editModal');
    }

    populateAttendeeCheckboxes(selectedIds) {
        const container = document.getElementById('attendeeCheckboxes');

        if (this.attendees.length === 0) {
            container.innerHTML = '<div class="empty-list-message">No attendees available</div>';
            return;
        }

        container.innerHTML = this.attendees.map(attendee => `
            <label class="checkbox-label">
                <input type="checkbox" value="${attendee.id}"
                    ${selectedIds.includes(attendee.id) ? 'checked' : ''}>
                ${attendee.name}
            </label>
        `).join('');
    }

    saveSession() {
        // Get form values
        const title = document.getElementById('sessionTitle').value.trim();
        const speakerId = parseInt(document.getElementById('sessionSpeaker').value);
        const roomId = parseInt(document.getElementById('sessionRoom').value);
        const date = document.getElementById('sessionDate').value;
        const startTime = document.getElementById('sessionStartTime').value;
        const endTime = document.getElementById('sessionEndTime').value;
        const description = document.getElementById('sessionDescription').value.trim();
        const tagsStr = document.getElementById('sessionTags').value.trim();
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

        // Get selected attendees
        const selectedAttendees = Array.from(
            document.querySelectorAll('#attendeeCheckboxes input:checked')
        ).map(input => parseInt(input.value));

        // Validation
        if (!title || !speakerId || !roomId || !date || !startTime || !endTime) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (this.editingSessionId) {
            // Update existing session
            const session = this.sessions.find(s => s.id === this.editingSessionId);
            if (session) {
                const oldTitle = session.title;
                session.title = title;
                session.speakerId = speakerId;
                session.roomId = roomId;
                session.date = date;
                session.startTime = startTime;
                session.endTime = endTime;
                session.description = description;
                session.tags = tags;
                session.attendees = selectedAttendees;
                session.lastUpdated = new Date().toISOString();

                this.saveToStorage();
                this.render();
                this.updateStats();
                this.closeModal('editModal');
                this.showToast('Session updated successfully', 'success');

                // Send notification
                this.sendNotification(
                    'Session Updated',
                    `"${oldTitle}" has been updated. Check the latest details.`,
                    `session-${this.editingSessionId}`
                );
            }
        } else {
            // Create new session
            const newSession = {
                id: Date.now(),
                title,
                speakerId,
                roomId,
                date,
                startTime,
                endTime,
                description,
                tags,
                attendees: selectedAttendees,
                lastUpdated: null
            };

            this.sessions.push(newSession);
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.checkSetupState();
            this.closeModal('editModal');
            this.showToast('Session added successfully', 'success');

            // Send notification
            this.sendNotification(
                'New Session Added',
                `"${title}" has been added to the schedule.`,
                `session-new-${newSession.id}`
            );
        }
    }

    deleteSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return;

        if (confirm(`Are you sure you want to delete "${session.title}"?`)) {
            this.sessions = this.sessions.filter(s => s.id !== sessionId);
            this.favorites.delete(sessionId);
            this.saveToStorage();
            this.render();
            this.updateStats();
            this.checkSetupState();
            this.showToast('Session deleted', 'success');

            // Send notification
            this.sendNotification(
                'Session Cancelled',
                `"${session.title}" has been removed from the schedule.`,
                `session-delete-${sessionId}`
            );
        }
    }

    toggleFavorite(sessionId) {
        if (this.favorites.has(sessionId)) {
            this.favorites.delete(sessionId);
            this.showToast('Removed from favorites', 'info');
        } else {
            this.favorites.add(sessionId);
            this.showToast('Added to favorites', 'success');
        }
        this.saveToStorage();
        this.render();
        this.updateStats();
    }

    // ============================================
    // MODAL MANAGEMENT
    // ============================================
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // ============================================
    // STATISTICS
    // ============================================
    updateStats() {
        document.getElementById('totalSessions').textContent = this.sessions.length;
        document.getElementById('totalAttendees').textContent = this.attendees.length;
        document.getElementById('totalRooms').textContent = this.rooms.length;
        document.getElementById('mySessions').textContent = this.favorites.size;
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        container.appendChild(toast);

        // Add close button listener
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    getDuration(startTime, endTime) {
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
        } else if (hours > 0) {
            return `${hours}h`;
        } else {
            return `${mins}m`;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    getRelativeTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    window.eventManager = new EventManager();
});
