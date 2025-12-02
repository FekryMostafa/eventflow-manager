// ============================================
// EVENT MANAGEMENT APPLICATION
// ============================================

class EventManager {
    constructor() {
        this.sessions = [];
        this.attendees = [];
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
        this.favorites = new Set();

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    init() {
        this.loadFromStorage();
        this.initSampleData();
        this.setupEventListeners();
        this.checkNotificationPermission();
        this.render();
        this.updateStats();
        this.populateFilters();
    }

    initSampleData() {
        // Only initialize if no data exists
        if (this.sessions.length === 0) {
            // Define attendees
            this.attendees = [
                { id: 1, name: 'Sarah Chen', email: 'sarah.chen@example.com' },
                { id: 2, name: 'Marcus Williams', email: 'marcus.w@example.com' },
                { id: 3, name: 'Elena Rodriguez', email: 'elena.r@example.com' },
                { id: 4, name: 'James Park', email: 'james.park@example.com' },
                { id: 5, name: 'Amara Okafor', email: 'amara.o@example.com' },
                { id: 6, name: 'David Kim', email: 'david.kim@example.com' },
                { id: 7, name: 'Sophie Turner', email: 'sophie.t@example.com' },
                { id: 8, name: 'Raj Patel', email: 'raj.patel@example.com' },
                { id: 9, name: 'Isabella Santos', email: 'isabella.s@example.com' },
                { id: 10, name: 'Omar Hassan', email: 'omar.h@example.com' },
                { id: 11, name: 'Lily Zhang', email: 'lily.zhang@example.com' },
                { id: 12, name: 'Alex Morgan', email: 'alex.m@example.com' },
                { id: 13, name: 'Nina Kowalski', email: 'nina.k@example.com' },
                { id: 14, name: 'Carlos Mendez', email: 'carlos.m@example.com' },
                { id: 15, name: 'Aisha Johnson', email: 'aisha.j@example.com' }
            ];

            // Define rooms
            this.rooms = [
                'Main Auditorium',
                'Innovation Lab',
                'Workshop Hall',
                'Studio 4'
            ];

            // Define sessions with rich data
            this.sessions = [
                {
                    id: 1,
                    title: 'The Future of AI: Beyond Machine Learning',
                    speaker: 'Dr. Sarah Chen',
                    room: 'Main Auditorium',
                    date: '2025-12-15',
                    startTime: '09:00',
                    endTime: '10:30',
                    description: 'Explore the cutting-edge developments in artificial intelligence, including neural architectures, autonomous systems, and ethical considerations. This keynote will set the stage for understanding how AI will transform industries over the next decade.',
                    tags: ['AI', 'Machine Learning', 'Keynote'],
                    attendees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    lastUpdated: null
                },
                {
                    id: 2,
                    title: 'Building Scalable Microservices Architecture',
                    speaker: 'Marcus Williams',
                    room: 'Innovation Lab',
                    date: '2025-12-15',
                    startTime: '09:00',
                    endTime: '10:00',
                    description: 'Learn best practices for designing and implementing microservices that can scale to millions of users. We\'ll cover service mesh, API gateways, and distributed tracing.',
                    tags: ['Backend', 'Architecture', 'Microservices'],
                    attendees: [2, 5, 8, 11, 14],
                    lastUpdated: null
                },
                {
                    id: 3,
                    title: 'Modern Frontend Development with Web Components',
                    speaker: 'Elena Rodriguez',
                    room: 'Workshop Hall',
                    date: '2025-12-15',
                    startTime: '10:00',
                    endTime: '11:30',
                    description: 'Hands-on workshop covering the latest in frontend development. Build reusable web components, optimize performance, and create delightful user experiences.',
                    tags: ['Frontend', 'JavaScript', 'Workshop'],
                    attendees: [3, 6, 9, 12, 15],
                    lastUpdated: null
                },
                {
                    id: 4,
                    title: 'Cloud Native Security: Best Practices',
                    speaker: 'James Park',
                    room: 'Studio 4',
                    date: '2025-12-15',
                    startTime: '11:00',
                    endTime: '12:00',
                    description: 'Deep dive into securing cloud-native applications. Topics include zero-trust architecture, container security, secrets management, and compliance automation.',
                    tags: ['Security', 'Cloud', 'DevOps'],
                    attendees: [4, 7, 10, 13],
                    lastUpdated: null
                },
                {
                    id: 5,
                    title: 'Data Science in Production: From Notebook to Pipeline',
                    speaker: 'Amara Okafor',
                    room: 'Main Auditorium',
                    date: '2025-12-15',
                    startTime: '11:00',
                    endTime: '12:30',
                    description: 'Transform your data science projects from Jupyter notebooks into production-ready pipelines. Learn about MLOps, model monitoring, and continuous training.',
                    tags: ['Data Science', 'MLOps', 'Python'],
                    attendees: [1, 5, 8, 11, 14],
                    lastUpdated: null
                },
                {
                    id: 6,
                    title: 'Lunch & Network',
                    speaker: 'All Attendees',
                    room: 'Main Auditorium',
                    date: '2025-12-15',
                    startTime: '12:30',
                    endTime: '14:00',
                    description: 'Enjoy lunch and connect with fellow attendees, speakers, and sponsors. Great opportunity for networking and discussions.',
                    tags: ['Networking', 'Break'],
                    attendees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    lastUpdated: null
                },
                {
                    id: 7,
                    title: 'Building Developer Communities That Thrive',
                    speaker: 'Sophie Turner',
                    room: 'Innovation Lab',
                    date: '2025-12-15',
                    startTime: '14:00',
                    endTime: '15:00',
                    description: 'Learn strategies for building, growing, and maintaining engaged developer communities. From online forums to in-person meetups, discover what works.',
                    tags: ['Community', 'DevRel', 'Leadership'],
                    attendees: [7, 9, 12, 15],
                    lastUpdated: null
                },
                {
                    id: 8,
                    title: 'GraphQL vs REST: Making the Right Choice',
                    speaker: 'Raj Patel',
                    room: 'Workshop Hall',
                    date: '2025-12-15',
                    startTime: '14:00',
                    endTime: '15:30',
                    description: 'Compare GraphQL and REST APIs through real-world examples. Understand when to use each approach and how to implement them effectively.',
                    tags: ['API', 'GraphQL', 'Backend'],
                    attendees: [2, 8, 11, 14],
                    lastUpdated: null
                },
                {
                    id: 9,
                    title: 'Kubernetes in Production: Lessons Learned',
                    speaker: 'Omar Hassan',
                    room: 'Studio 4',
                    date: '2025-12-15',
                    startTime: '15:30',
                    endTime: '17:00',
                    description: 'Real-world lessons from running Kubernetes at scale. Topics include cluster management, resource optimization, and disaster recovery.',
                    tags: ['Kubernetes', 'DevOps', 'Infrastructure'],
                    attendees: [4, 10, 13],
                    lastUpdated: null
                },
                {
                    id: 10,
                    title: 'Closing Keynote: Tech Trends 2026',
                    speaker: 'Isabella Santos',
                    room: 'Main Auditorium',
                    date: '2025-12-15',
                    startTime: '17:00',
                    endTime: '18:00',
                    description: 'A forward-looking discussion on emerging technologies and trends that will shape the industry in 2026 and beyond. Q&A session included.',
                    tags: ['Keynote', 'Trends', 'Future'],
                    attendees: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    lastUpdated: null
                }
            ];

            this.saveToStorage();
        }
    }

    // ============================================
    // STORAGE MANAGEMENT
    // ============================================
    saveToStorage() {
        localStorage.setItem('eventflow_sessions', JSON.stringify(this.sessions));
        localStorage.setItem('eventflow_attendees', JSON.stringify(this.attendees));
        localStorage.setItem('eventflow_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('eventflow_favorites', JSON.stringify([...this.favorites]));
    }

    loadFromStorage() {
        const sessions = localStorage.getItem('eventflow_sessions');
        const attendees = localStorage.getItem('eventflow_attendees');
        const rooms = localStorage.getItem('eventflow_rooms');
        const favorites = localStorage.getItem('eventflow_favorites');

        if (sessions) this.sessions = JSON.parse(sessions);
        if (attendees) this.attendees = JSON.parse(attendees);
        if (rooms) this.rooms = JSON.parse(rooms);
        if (favorites) this.favorites = new Set(JSON.parse(favorites));
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    setupEventListeners() {
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
                new Notification('EventFlow Notifications', {
                    body: 'You\'ll now receive updates about session changes.',
                    icon: '🔔',
                    tag: 'eventflow-welcome'
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

    sendNotification(title, body, tag = 'eventflow-update') {
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
                const matchesSearch =
                    session.title.toLowerCase().includes(searchLower) ||
                    session.speaker.toLowerCase().includes(searchLower) ||
                    session.description.toLowerCase().includes(searchLower) ||
                    session.tags.some(tag => tag.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;
            }

            // Room filter
            if (this.filters.room && session.room !== this.filters.room) {
                return false;
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
            option.value = room;
            option.textContent = room;
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

        if (filteredSessions.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
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
        const roomClass = this.getRoomClass(session.room);
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
                        <div class="session-speaker">${session.speaker}</div>
                        <div class="session-meta">
                            <div class="meta-item">
                                <span class="meta-icon">📍</span>
                                <span class="room-badge ${roomClass}">${session.room}</span>
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

        const attendeeDetails = session.attendees
            .map(id => this.attendees.find(a => a.id === id))
            .filter(a => a);

        const roomClass = this.getRoomClass(session.room);

        const modalContent = `
            <div class="modal-session-header">
                <h2 class="modal-session-title">${session.title}</h2>
                <div class="modal-session-speaker">By ${session.speaker}</div>
                <div class="session-meta">
                    <span class="room-badge ${roomClass}">${session.room}</span>
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
        `;

        document.querySelector('#sessionModal .modal-body').innerHTML = modalContent;
        this.openModal('sessionModal');
    }

    openAddSessionModal() {
        this.editingSessionId = null;
        document.getElementById('editModalTitle').textContent = 'Add New Session';

        // Reset form
        document.getElementById('sessionForm').reset();
        document.getElementById('sessionDate').value = '2025-12-15';

        // Populate attendee checkboxes
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
        document.getElementById('sessionSpeaker').value = session.speaker;
        document.getElementById('sessionRoom').value = session.room;
        document.getElementById('sessionDate').value = session.date;
        document.getElementById('sessionStartTime').value = session.startTime;
        document.getElementById('sessionEndTime').value = session.endTime;
        document.getElementById('sessionDescription').value = session.description;
        document.getElementById('sessionTags').value = session.tags.join(', ');

        // Populate attendee checkboxes
        this.populateAttendeeCheckboxes(session.attendees);

        this.openModal('editModal');
    }

    populateAttendeeCheckboxes(selectedIds) {
        const container = document.getElementById('attendeeCheckboxes');
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
        const speaker = document.getElementById('sessionSpeaker').value.trim();
        const room = document.getElementById('sessionRoom').value;
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
        if (!title || !speaker || !room || !date || !startTime || !endTime) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (this.editingSessionId) {
            // Update existing session
            const session = this.sessions.find(s => s.id === this.editingSessionId);
            if (session) {
                const oldTitle = session.title;
                session.title = title;
                session.speaker = speaker;
                session.room = room;
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
                speaker,
                room,
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
            this.populateFilters();
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

    getRoomClass(room) {
        const roomMap = {
            'Main Auditorium': 'room-main',
            'Innovation Lab': 'room-innovation',
            'Workshop Hall': 'room-workshop',
            'Studio 4': 'room-studio'
        };
        return roomMap[room] || '';
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
