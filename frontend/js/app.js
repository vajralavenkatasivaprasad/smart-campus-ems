// ============================================================
// Smart Campus EMS - Complete Frontend JavaScript
// ============================================================

const API = 'http://localhost:8080/api';
let currentUser = null;
let authToken = null;
let allEvents = [];
let map = null;
let otpEmail = '';
let currentSection = 'dashboard';

// ============================================================
// INITIALIZATION
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
    // Loading animation
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        const savedToken = localStorage.getItem('ems_token');
        const savedUser = localStorage.getItem('ems_user');
        if (savedToken && savedUser) {
            authToken = savedToken;
            currentUser = JSON.parse(savedUser);
            showApp();
        } else {
            document.getElementById('authModal').classList.add('active');
        }
    }, 2200);

    setGreeting();
    setInterval(updateNotifBadge, 30000);
});

// ============================================================
// AUTH FUNCTIONS
// ============================================================

function switchAuth(type) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(type + 'Form').classList.add('active');
}

function togglePass(id) {
    const input = document.getElementById(id);
    const btn = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function fillDemo(email, pass) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = pass;
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { showToast('Please fill all fields', 'error'); return; }

    showToast('Signing in...', 'info');

    // Demo mode: simulate login without backend
    const demoUsers = {
        'admin@campus.edu': { id: 1, name: 'Admin User', email: 'admin@campus.edu', role: 'ADMIN', department: 'Administration' },
        'priya@campus.edu': { id: 2, name: 'Dr. Priya Sharma', email: 'priya@campus.edu', role: 'ORGANIZER', department: 'Computer Science' },
        'rahul@campus.edu': { id: 3, name: 'Rahul Kumar', email: 'rahul@campus.edu', role: 'STUDENT', department: 'Electronics' },
    };

    if (demoUsers[email] && password === 'password123') {
        currentUser = demoUsers[email];
        authToken = 'demo_token_' + Date.now();
        localStorage.setItem('ems_token', authToken);
        localStorage.setItem('ems_user', JSON.stringify(currentUser));
        document.getElementById('authModal').classList.remove('active');
        showApp();
        showToast(`Welcome back, ${currentUser.name.split(' ')[0]}! 🎉`, 'success');
        return;
    }

    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('ems_token', authToken);
        localStorage.setItem('ems_user', JSON.stringify(currentUser));
        document.getElementById('authModal').classList.remove('active');
        showApp();
        showToast(`Welcome back, ${currentUser.name.split(' ')[0]}! 🎉`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value.trim();
    const dept = document.getElementById('regDept').value.trim();
    const role = document.getElementById('regRole').value;

    if (!name || !email || !password) { showToast('Please fill required fields', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }

    showToast('Creating account...', 'info');

    // Demo mode
    otpEmail = email;
    document.getElementById('otpEmailDisplay').textContent = email;
    switchAuth('otp');
    showToast('OTP sent to your email! (Demo: use 123456)', 'success');

    // startOtpTimer(600);
    // try {
    //     const res = await fetch(`${API}/auth/register`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ name, email, password, phone, department: dept, role })
    //     });
    //     const data = await res.json();
    //     if (!res.ok) throw new Error(data.error || 'Registration failed');
    //     otpEmail = email;
    //     document.getElementById('otpEmailDisplay').textContent = email;
    //     switchAuth('otp');
    //     startOtpTimer(600);
    //     showToast('OTP sent to your email!', 'success');
    // } catch (err) { showToast(err.message, 'error'); }
}

async function handleVerifyOtp() {
    const otp = [0,1,2,3,4,5].map(i => document.getElementById('otp'+i).value).join('');
    if (otp.length < 6) { showToast('Enter complete 6-digit OTP', 'error'); return; }

    // Demo mode
    if (otp === '123456') {
        currentUser = { id: 99, name: document.getElementById('regName').value || 'New User', email: otpEmail, role: 'STUDENT', department: '' };
        authToken = 'demo_token_' + Date.now();
        localStorage.setItem('ems_token', authToken);
        localStorage.setItem('ems_user', JSON.stringify(currentUser));
        document.getElementById('authModal').classList.remove('active');
        showApp();
        showToast('Email verified! Welcome! 🎉', 'success');
        return;
    }

    try {
        const res = await fetch(`${API}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: otpEmail, otp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid OTP');
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('ems_token', authToken);
        localStorage.setItem('ems_user', JSON.stringify(currentUser));
        document.getElementById('authModal').classList.remove('active');
        showApp();
        showToast('Email verified! Welcome! 🎉', 'success');
    } catch (err) { showToast(err.message, 'error'); }
}

async function handleResendOtp() {
    showToast('OTP resent! (Demo: 123456)', 'success');
    startOtpTimer(600);
}

function otpMove(idx) {
    const val = document.getElementById('otp' + idx).value;
    if (val && idx < 5) document.getElementById('otp' + (idx + 1)).focus();
}

function startOtpTimer(seconds) {
    const el = document.getElementById('otpTimer');
    clearInterval(window._otpInterval);
    window._otpInterval = setInterval(() => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        el.textContent = `OTP expires in ${m}:${s.toString().padStart(2,'0')}`;
        seconds--;
        if (seconds < 0) { clearInterval(window._otpInterval); el.textContent = 'OTP expired. Please resend.'; }
    }, 1000);
}

function handleLogout() {
    authToken = null; currentUser = null;
    localStorage.removeItem('ems_token');
    localStorage.removeItem('ems_user');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('authModal').classList.add('active');
    switchAuth('login');
    showToast('Logged out successfully', 'success');
}

// ============================================================
// APP INITIALIZATION
// ============================================================

function showApp() {
    document.getElementById('authModal').classList.remove('active');
    document.getElementById('app').classList.remove('hidden');

    // Set user info in UI
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('topAvatar').textContent = initials;
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarRole').textContent = currentUser.role;
    document.getElementById('topName').textContent = currentUser.name.split(' ')[0];

    // Show/hide role-based nav
    const isAdmin = currentUser.role === 'ADMIN';
    const isOrganizer = currentUser.role === 'ORGANIZER' || isAdmin;
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
    document.querySelectorAll('.organizer-only').forEach(el => el.style.display = isOrganizer ? '' : 'none');

    // Load data
    loadDashboard();
    loadAllEvents();
    updateNotifBadge();
}

// ============================================================
// NAVIGATION
// ============================================================

function showSection(name) {
    currentSection = name;
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const sec = document.getElementById('sec-' + name);
    if (sec) sec.classList.add('active');

    // Set active nav item
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(`'${name}'`)) {
            n.classList.add('active');
        }
    });

    // Close sidebar on mobile
    if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');

    // Section-specific loads
    if (name === 'map') initMap();
    if (name === 'myEvents') loadMyRegistrations();
    if (name === 'notifications') loadNotifications();
    if (name === 'admin') loadAdmin();

    window.scrollTo(0, 0);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {
    setGreeting();
    loadDashboardStats();
    loadFeaturedEvents();
    loadUpcomingEvents();
}

function setGreeting() {
    const hour = new Date().getHours();
    let greet = 'Good Morning';
    if (hour >= 12 && hour < 17) greet = 'Good Afternoon';
    else if (hour >= 17) greet = 'Good Evening';
    const el = document.getElementById('dashGreeting');
    if (el && currentUser) el.textContent = `${greet}, ${currentUser.name.split(' ')[0]}! 👋`;
}

async function loadDashboardStats() {
    // Demo stats
    const demoStats = { totalEvents: 5, upcomingEvents: 5, completedEvents: 0, totalRegistrations: 12 };
    try {
        const res = await apiGet('/events/stats');
        const stats = res || demoStats;
        animateCount('statTotal', stats.totalEvents || demoStats.totalEvents);
        animateCount('statUpcoming', stats.upcomingEvents || demoStats.upcomingEvents);
        animateCount('statCompleted', stats.completedEvents || demoStats.completedEvents);
        animateCount('statRegistrations', stats.totalRegistrations || demoStats.totalRegistrations);
    } catch {
        animateCount('statTotal', demoStats.totalEvents);
        animateCount('statUpcoming', demoStats.upcomingEvents);
        animateCount('statCompleted', demoStats.completedEvents);
        animateCount('statRegistrations', demoStats.totalRegistrations);
    }
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let count = 0; const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count;
        if (count >= target) clearInterval(timer);
    }, 50);
}

async function loadFeaturedEvents() {
    const container = document.getElementById('featuredEvents');
    const events = await getEvents('featured');
    if (!events.length) { container.innerHTML = '<p style="color:#64748b">No featured events.</p>'; return; }
    container.innerHTML = events.map(e => `
        <div class="featured-card" onclick="openEventModal(${e.id})">
            <div class="featured-badge">⭐ FEATURED</div>
            <div class="featured-title">${e.title}</div>
            <div class="featured-venue">📍 ${e.venue || 'Campus'}</div>
            <div class="featured-date">📅 ${formatDate(e.startDatetime)}</div>
            <button class="featured-register" onclick="event.stopPropagation(); registerEvent(${e.id}, this)">Register Now</button>
        </div>
    `).join('');
}

async function loadUpcomingEvents() {
    const container = document.getElementById('dashUpcomingEvents');
    const events = await getEvents('upcoming');
    if (!events.length) { container.innerHTML = emptyState('No upcoming events'); return; }
    container.innerHTML = events.slice(0, 6).map(e => renderEventCard(e)).join('');
}

// ============================================================
// EVENTS
// ============================================================

async function loadAllEvents() {
    const container = document.getElementById('allEventsGrid');
    container.innerHTML = '<div class="loading-events"><i class="fas fa-spinner fa-spin"></i> Loading events...</div>';
    allEvents = await getEvents('all');
    renderEventsGrid(allEvents, 'allEventsGrid');
}

async function getEvents(type) {
    const demoEvents = getDemoEvents();
    try {
        let url = '/events';
        if (type === 'featured') url = '/events/featured';
        else if (type === 'upcoming') url = '/events/upcoming';
        const res = await apiGet(url);
        return res && res.length ? res : demoEvents;
    } catch {
        return demoEvents;
    }
}

function getDemoEvents() {
    return [
        { id: 1, title: 'TechFest 2025 - Annual Tech Symposium', description: 'The biggest technical festival of the year featuring hackathons, robotics competitions, and industry expert talks from top tech companies worldwide.', category: 'TECHNICAL', venue: 'Main Auditorium, Block A', startDatetime: '2025-09-15T09:00:00', endDatetime: '2025-09-17T18:00:00', maxCapacity: 500, registeredCount: 320, status: 'UPCOMING', isFeatured: true, latitude: 12.9716, longitude: 77.5946 },
        { id: 2, title: 'Cultural Night - Fusion 2025', description: 'A spectacular evening of music, dance, and drama celebrating diverse cultures of our campus community.', category: 'CULTURAL', venue: 'Open Air Theatre', startDatetime: '2025-08-20T18:00:00', endDatetime: '2025-08-20T22:00:00', maxCapacity: 800, registeredCount: 450, status: 'UPCOMING', isFeatured: true, latitude: 12.9720, longitude: 77.5950 },
        { id: 3, title: 'Machine Learning Workshop', description: 'Hands-on workshop covering ML fundamentals, Python libraries, and real-world project implementation with industry mentors.', category: 'WORKSHOP', venue: 'CS Lab 301', startDatetime: '2025-07-10T10:00:00', endDatetime: '2025-07-10T17:00:00', maxCapacity: 60, registeredCount: 55, status: 'UPCOMING', isFeatured: false, latitude: 12.9715, longitude: 77.5948 },
        { id: 4, title: 'Inter-College Cricket Tournament', description: 'Annual cricket championship featuring teams from 20+ colleges competing for the prestigious campus trophy.', category: 'SPORTS', venue: 'Main Cricket Ground', startDatetime: '2025-08-01T08:00:00', endDatetime: '2025-08-05T18:00:00', maxCapacity: 200, registeredCount: 80, status: 'UPCOMING', isFeatured: true, latitude: 12.9725, longitude: 77.5942 },
        { id: 5, title: 'Research Paper Seminar', description: 'Graduate students present research findings. Topics include AI, IoT, Blockchain, and Sustainable Technology.', category: 'SEMINAR', venue: 'Seminar Hall B', startDatetime: '2025-07-25T14:00:00', endDatetime: '2025-07-25T17:00:00', maxCapacity: 100, registeredCount: 34, status: 'UPCOMING', isFeatured: false, latitude: 12.9718, longitude: 77.5944 },
    ];
}

function renderEventCard(e) {
    const pct = Math.round((e.registeredCount / e.maxCapacity) * 100);
    const catIcon = getCategoryIcon(e.category);
    const isFull = e.registeredCount >= e.maxCapacity;
    return `
    <div class="event-card" onclick="openEventModal(${e.id})">
        <div class="event-banner cat-${e.category}">
            <div class="event-banner-icon">${catIcon}</div>
            <div class="event-category-badge">${e.category}</div>
            <div class="event-status-badge ${e.status}">${e.status}</div>
            ${e.isFeatured ? '<div class="event-featured-star">⭐</div>' : ''}
        </div>
        <div class="event-body">
            <div class="event-title">${e.title}</div>
            <div class="event-meta">
                <div class="event-meta-item"><i class="fas fa-map-marker-alt"></i> ${e.venue || 'TBD'}</div>
                <div class="event-meta-item"><i class="fas fa-calendar"></i> ${formatDate(e.startDatetime)}</div>
                <div class="event-meta-item"><i class="fas fa-users"></i> ${e.registeredCount}/${e.maxCapacity} registered</div>
            </div>
            <div class="event-footer">
                <div class="event-capacity-bar">
                    <div class="capacity-label">${pct}% filled</div>
                    <div class="capacity-track">
                        <div class="capacity-fill" style="width:${pct}%"></div>
                    </div>
                </div>
                <button class="btn-register ${isFull ? 'full' : ''}"
                    onclick="event.stopPropagation(); registerEvent(${e.id}, this)"
                    ${isFull ? 'disabled' : ''}>
                    ${isFull ? 'Full' : 'Register'}
                </button>
            </div>
        </div>
    </div>`;
}

function renderEventsGrid(events, containerId) {
    const container = document.getElementById(containerId);
    if (!events.length) { container.innerHTML = emptyState('No events found', 'fas fa-calendar-times'); return; }
    container.innerHTML = events.map(e => renderEventCard(e)).join('');
}

function filterEvents(category, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = category === 'ALL' ? allEvents : allEvents.filter(e => e.category === category);
    renderEventsGrid(filtered, 'allEventsGrid');
}

// ============================================================
// EVENT MODAL
// ============================================================

function openEventModal(id) {
    const event = allEvents.find(e => e.id === id) || getDemoEvents().find(e => e.id === id);
    if (!event) return;
    const pct = Math.round((event.registeredCount / event.maxCapacity) * 100);
    const catIcon = getCategoryIcon(event.category);

    document.getElementById('eventModalContent').innerHTML = `
        <div class="modal-banner cat-${event.category}">
            <span style="font-size:80px">${catIcon}</span>
        </div>
        <div class="modal-body">
            <div class="modal-category">${event.category}</div>
            <div class="modal-title">${event.title}</div>
            <p class="modal-desc">${event.description}</p>
            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <div class="modal-info-label">📍 Venue</div>
                    <div class="modal-info-value">${event.venue || 'TBD'}</div>
                </div>
                <div class="modal-info-item">
                    <div class="modal-info-label">📅 Start Date</div>
                    <div class="modal-info-value">${formatDate(event.startDatetime)}</div>
                </div>
                <div class="modal-info-item">
                    <div class="modal-info-label">🏁 End Date</div>
                    <div class="modal-info-value">${formatDate(event.endDatetime)}</div>
                </div>
                <div class="modal-info-item">
                    <div class="modal-info-label">👥 Capacity</div>
                    <div class="modal-info-value">${event.registeredCount}/${event.maxCapacity} (${pct}% filled)</div>
                </div>
                <div class="modal-info-item">
                    <div class="modal-info-label">📌 Status</div>
                    <div class="modal-info-value">${event.status}</div>
                </div>
                <div class="modal-info-item">
                    <div class="modal-info-label">⭐ Featured</div>
                    <div class="modal-info-value">${event.isFeatured ? 'Yes' : 'No'}</div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn-primary" onclick="registerEvent(${event.id}, this); closeEventModal()">
                    <i class="fas fa-ticket-alt"></i> Register Now
                </button>
                <button class="btn-outline" onclick="showEventOnMap(${event.latitude}, ${event.longitude}, '${event.title}')">
                    <i class="fas fa-map-marked-alt"></i> View on Map
                </button>
            </div>
        </div>
    `;
    document.getElementById('eventModal').classList.add('active');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
}

document.getElementById('eventModal').addEventListener('click', function(e) {
    if (e.target === this) closeEventModal();
});

// ============================================================
// REGISTRATION
// ============================================================

const userRegistrations = new Set();

async function registerEvent(eventId, btn) {
    if (userRegistrations.has(eventId)) {
        showToast('Already registered for this event!', 'warning'); return;
    }

    showToast('Registering...', 'info');
    userRegistrations.add(eventId);

    // Update event count in demo
    const event = allEvents.find(e => e.id === eventId) || getDemoEvents().find(e => e.id === eventId);
    if (event) event.registeredCount++;

    // Update button states
    document.querySelectorAll(`[onclick*="registerEvent(${eventId}"]`).forEach(b => {
        b.textContent = '✓ Registered';
        b.classList.add('registered');
    });

    showToast(`🎉 Registered for "${event ? event.title : 'event'}"! Check your email.`, 'success');

    // Add to My Registrations
    if (!window.demoRegistrations) window.demoRegistrations = [];
    window.demoRegistrations.push({
        id: Date.now(), eventId,
        eventTitle: event ? event.title : 'Event',
        venue: event ? event.venue : '',
        startDate: event ? event.startDatetime : '',
        regCode: 'EMS-' + String(eventId).padStart(4,'0') + '-' + Date.now() % 100000,
        status: 'CONFIRMED'
    });

    // Try backend
    try {
        await apiPost(`/events/${eventId}/register`, {});
    } catch {}
}

async function loadMyRegistrations() {
    const container = document.getElementById('myRegistrationsGrid');
    const regs = window.demoRegistrations || [];

    if (!regs.length) {
        container.innerHTML = emptyState("You haven't registered for any events yet", 'fas fa-ticket-alt');
        // Try backend
        try {
            const data = await apiGet('/events/my-registrations');
            if (data && data.length) renderMyRegistrations(data);
        } catch {}
        return;
    }

    container.innerHTML = regs.map(r => `
        <div class="reg-card">
            <div class="reg-card-left"></div>
            <div class="reg-card-body">
                <div class="event-title">${r.eventTitle}</div>
                <div class="event-meta">
                    <div class="event-meta-item"><i class="fas fa-map-marker-alt"></i> ${r.venue}</div>
                    <div class="event-meta-item"><i class="fas fa-calendar"></i> ${formatDate(r.startDate)}</div>
                </div>
                <div class="reg-status ${r.status}">${r.status}</div>
            </div>
            <div class="reg-card-right">
                <div style="width:80px;height:80px;background:linear-gradient(135deg,#6C3FF7,#06B6D4);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:32px">🎟️</div>
                <div class="reg-code">${r.regCode}</div>
                <button class="btn-danger" style="margin-top:8px;font-size:11px;padding:6px 10px"
                    onclick="cancelReg(${r.id}, ${r.eventId})">Cancel</button>
            </div>
        </div>
    `).join('');
}

function cancelReg(regId, eventId) {
    if (!confirm('Cancel this registration?')) return;
    window.demoRegistrations = (window.demoRegistrations || []).filter(r => r.id !== regId);
    userRegistrations.delete(eventId);
    loadMyRegistrations();
    showToast('Registration cancelled', 'warning');
}

// ============================================================
// CAMPUS MAP
// ============================================================

function initMap() {
    if (map) { map.invalidateSize(); populateMapEvents(); return; }

    map = L.map('campusMap').setView([12.9716, 77.5946], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    populateMapEvents();
}

function populateMapEvents() {
    if (!map) return;
    const events = getDemoEvents();
    const listEl = document.getElementById('mapEventList');
    listEl.innerHTML = '';

    const catColors = {
        TECHNICAL: '#4F46E5', CULTURAL: '#EC4899', SPORTS: '#10B981',
        WORKSHOP: '#F59E0B', SEMINAR: '#8B5CF6', ACADEMIC: '#3B82F6', OTHER: '#64748B'
    };

    events.forEach(ev => {
        if (!ev.latitude || !ev.longitude) return;

        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background:${catColors[ev.category]};color:white;padding:6px 12px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.3)">${getCategoryIcon(ev.category)} ${ev.category}</div>`,
            iconAnchor: [50, 0]
        });

        const marker = L.marker([ev.latitude, ev.longitude], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="padding:8px;min-width:200px">
                    <strong>${ev.title}</strong><br>
                    📍 ${ev.venue}<br>
                    📅 ${formatDate(ev.startDatetime)}<br>
                    👥 ${ev.registeredCount}/${ev.maxCapacity}
                </div>
            `);

        // List item
        const item = document.createElement('div');
        item.className = 'map-event-item';
        item.innerHTML = `<h4>${ev.title}</h4><p>📍 ${ev.venue} | ${formatDate(ev.startDatetime)}</p>`;
        item.onclick = () => { map.setView([ev.latitude, ev.longitude], 18); marker.openPopup(); };
        listEl.appendChild(item);
    });
}

function showEventOnMap(lat, lng, title) {
    closeEventModal();
    showSection('map');
    setTimeout(() => {
        if (map && lat && lng) {
            map.setView([lat, lng], 18);
            L.popup().setLatLng([lat, lng]).setContent(`<b>${title}</b>`).openOn(map);
        }
    }, 300);
}

// ============================================================
// NOTIFICATIONS
// ============================================================

const demoNotifs = [
    { id: 1, title: 'Welcome to Smart Campus EMS! 🎓', message: 'We are excited to have you on board. Explore amazing campus events and register now!', type: 'INFO', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, title: 'TechFest 2025 Registration Open! 🚀', message: 'Register for the biggest technical festival of the year. Limited seats available!', type: 'SUCCESS', isRead: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, title: 'Cultural Night Reminder 🎭', message: 'Cultural Night is happening this Friday! Don\'t miss the spectacular performances.', type: 'WARNING', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 4, title: 'New Workshop Added 🔧', message: 'A new Machine Learning workshop has been scheduled. Seats are filling fast!', type: 'INFO', isRead: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

async function loadNotifications() {
    const container = document.getElementById('notificationsContainer');
    let notifs = demoNotifs;

    try {
        const data = await apiGet('/notifications');
        if (data && data.length) notifs = data;
    } catch {}

    container.innerHTML = notifs.map(n => `
        <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="markRead(${n.id}, this)">
            <div class="notif-icon ${n.type}">${getNotifIcon(n.type)}</div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-msg">${n.message}</div>
                <div class="notif-time">${timeAgo(n.createdAt)}</div>
            </div>
            ${!n.isRead ? '<div class="unread-dot"></div>' : ''}
        </div>
    `).join('');
}

function markRead(id, el) {
    el.classList.remove('unread');
    const dot = el.querySelector('.unread-dot');
    if (dot) dot.remove();
    const notif = demoNotifs.find(n => n.id === id);
    if (notif) notif.isRead = true;
    updateNotifBadge();
    try { apiPut(`/notifications/${id}/read`, {}); } catch {}
}

async function markAllRead() {
    demoNotifs.forEach(n => n.isRead = true);
    loadNotifications();
    updateNotifBadge();
    showToast('All notifications marked as read', 'success');
    try { await apiPut('/notifications/read-all', {}); } catch {}
}

function updateNotifBadge() {
    const count = demoNotifs.filter(n => !n.isRead).length;
    document.getElementById('notifBadge').textContent = count;
    document.getElementById('topNotifBadge').textContent = count;
    if (count === 0) {
        document.getElementById('notifBadge').style.display = 'none';
        document.getElementById('topNotifBadge').style.display = 'none';
    } else {
        document.getElementById('notifBadge').style.display = '';
        document.getElementById('topNotifBadge').style.display = '';
    }
}

// ============================================================
// CREATE EVENT
// ============================================================

async function submitCreateEvent() {
    const data = {
        title: document.getElementById('evTitle').value.trim(),
        description: document.getElementById('evDesc').value.trim(),
        category: document.getElementById('evCategory').value,
        venue: document.getElementById('evVenue').value.trim(),
        startDatetime: document.getElementById('evStart').value,
        endDatetime: document.getElementById('evEnd').value,
        maxCapacity: document.getElementById('evCapacity').value || 100,
        isFeatured: document.getElementById('evFeatured').checked,
        latitude: document.getElementById('evLat').value || null,
        longitude: document.getElementById('evLng').value || null,
    };

    if (!data.title || !data.category || !data.venue || !data.startDatetime) {
        showToast('Please fill all required fields', 'error'); return;
    }

    // Demo mode: add to local array
    const newEvent = { ...data, id: Date.now(), registeredCount: 0, status: 'UPCOMING' };
    allEvents.unshift(newEvent);
    getDemoEvents().unshift(newEvent);

    showToast('Event created successfully! 🎉', 'success');

    // Reset form
    ['evTitle','evDesc','evVenue','evStart','evEnd','evLat','evLng'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('evCategory').value = '';
    document.getElementById('evCapacity').value = 100;
    document.getElementById('evFeatured').checked = false;

    showSection('events');
    loadAllEvents();

    try {
        await apiPost('/events', data);
    } catch {}
}

// ============================================================
// ADMIN PANEL
// ============================================================

function showAdminTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const content = document.getElementById('adminContent');
    if (tab === 'events') renderAdminEvents(content);
    else if (tab === 'users') renderAdminUsers(content);
    else if (tab === 'analytics') renderAdminAnalytics(content);
}

function loadAdmin() {
    const content = document.getElementById('adminContent');
    renderAdminEvents(content);
}

function renderAdminEvents(container) {
    const events = getDemoEvents();
    container.innerHTML = `
        <div class="admin-table-container">
            <table>
                <thead><tr>
                    <th>Title</th><th>Category</th><th>Venue</th>
                    <th>Date</th><th>Registrations</th><th>Status</th><th>Actions</th>
                </tr></thead>
                <tbody>
                ${events.map(e => `
                    <tr>
                        <td><strong>${e.title}</strong></td>
                        <td><span class="event-category-badge" style="position:static;background:var(--primary-light);color:var(--primary)">${e.category}</span></td>
                        <td>${e.venue}</td>
                        <td>${formatDateShort(e.startDatetime)}</td>
                        <td>${e.registeredCount}/${e.maxCapacity}</td>
                        <td><span class="event-status-badge ${e.status}">${e.status}</span></td>
                        <td>
                            <button onclick="openEventModal(${e.id})" style="background:var(--primary);color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px">View</button>
                            <button onclick="adminDeleteEvent(${e.id})" style="background:var(--danger);color:white;border:none;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:12px;margin-left:4px">Delete</button>
                        </td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminUsers(container) {
    const users = [
        { name: 'Admin User', email: 'admin@campus.edu', role: 'ADMIN', dept: 'Administration', verified: true },
        { name: 'Dr. Priya Sharma', email: 'priya@campus.edu', role: 'ORGANIZER', dept: 'CS', verified: true },
        { name: 'Rahul Kumar', email: 'rahul@campus.edu', role: 'STUDENT', dept: 'Electronics', verified: true },
    ];
    container.innerHTML = `
        <div class="admin-table-container">
            <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Verified</th></tr></thead>
                <tbody>
                ${users.map(u => `
                    <tr>
                        <td><strong>${u.name}</strong></td>
                        <td>${u.email}</td>
                        <td><span style="background:var(--primary-light);color:var(--primary);padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700">${u.role}</span></td>
                        <td>${u.dept}</td>
                        <td>${u.verified ? '✅' : '❌'}</td>
                    </tr>
                `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminAnalytics(container) {
    const categories = [
        { name: 'Technical', count: 1 }, { name: 'Cultural', count: 1 },
        { name: 'Sports', count: 1 }, { name: 'Workshop', count: 1 }, { name: 'Seminar', count: 1 }
    ];
    const max = Math.max(...categories.map(c => c.count));
    container.innerHTML = `
        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>📊 Events by Category</h3>
                <div class="bar-chart">
                ${categories.map(c => `
                    <div class="bar-item">
                        <div class="bar-label">${c.name}</div>
                        <div class="bar-track"><div class="bar-fill" style="width:${(c.count/max)*100}%"></div></div>
                        <div class="bar-value">${c.count}</div>
                    </div>
                `).join('')}
                </div>
            </div>
            <div class="analytics-card">
                <h3>📈 Registration Stats</h3>
                <div style="padding:16px">
                    <p style="font-size:14px;color:#64748b;margin-bottom:12px">Total Events: <strong>5</strong></p>
                    <p style="font-size:14px;color:#64748b;margin-bottom:12px">Total Registrations: <strong>939</strong></p>
                    <p style="font-size:14px;color:#64748b;margin-bottom:12px">Avg per Event: <strong>187.8</strong></p>
                    <p style="font-size:14px;color:#64748b">Featured Events: <strong>3</strong></p>
                </div>
            </div>
        </div>
    `;
}

function adminDeleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    allEvents = allEvents.filter(e => e.id !== id);
    loadAdmin();
    showToast('Event deleted', 'warning');
    try { apiFetch('DELETE', `/events/${id}`); } catch {}
}

// ============================================================
// CHATBOT
// ============================================================

function toggleChatbot() {
    const bot = document.getElementById('chatbot');
    bot.classList.toggle('hidden');
}

function sendQuick(msg) {
    document.getElementById('chatInput').value = msg;
    sendChatMessage();
}

function chatKeyPress(e) {
    if (e.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';

    appendChatMsg('user', msg);
    appendTypingIndicator();

    try {
        const res = await fetch(`${API}/chatbot/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await res.json();
        removeTypingIndicator();
        appendChatMsg('bot', data.response || 'Sorry, I could not process that.');
    } catch {
        removeTypingIndicator();
        // Demo chatbot
        const reply = getDemoReply(msg.toLowerCase());
        appendChatMsg('bot', reply);
    }
}

function getDemoReply(msg) {
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey'))
        return '👋 Hello! I\'m your Smart Campus AI Assistant!\n\nI can help you with:\n📅 Upcoming events\n🔍 Event categories\n📝 How to register\n📍 Venue information\n\nWhat would you like to know?';
    if (msg.includes('upcoming') || msg.includes('events'))
        return '📅 Upcoming Events:\n\n🎯 TechFest 2025\n   📍 Main Auditorium | Sep 15\n\n🎭 Cultural Night\n   📍 Open Air Theatre | Aug 20\n\n🏏 Cricket Tournament\n   📍 Cricket Ground | Aug 1';
    if (msg.includes('technical') || msg.includes('tech'))
        return '💻 Technical Events:\n\n• TechFest 2025 - Annual Tech Symposium\n  📍 Main Auditorium | Sep 15-17\n  👥 500 capacity\n\nRegister now before seats fill up!';
    if (msg.includes('cultural') || msg.includes('dance') || msg.includes('music'))
        return '🎭 Cultural Events:\n\n• Cultural Night - Fusion 2025\n  📍 Open Air Theatre | Aug 20, 6 PM\n  👥 800 capacity\n\nAn evening of music, dance & drama!';
    if (msg.includes('sports') || msg.includes('cricket'))
        return '⚽ Sports Events:\n\n• Inter-College Cricket Tournament\n  📍 Cricket Ground | Aug 1-5\n  👥 200 capacity\n\n20+ colleges competing!';
    if (msg.includes('register') || msg.includes('how'))
        return '📝 How to Register:\n\n1. Browse the Events section\n2. Click on your desired event\n3. Click "Register Now"\n4. Get confirmation email with QR code!\n\n✨ It\'s that simple!';
    if (msg.includes('venue') || msg.includes('location') || msg.includes('where'))
        return '📍 Campus Venues:\n\n🏛️ Main Auditorium - Block A\n🎭 Open Air Theatre - Central Lawn\n💻 CS Lab 301 - CS Block, 3F\n🏏 Cricket Ground - South Campus\n🎤 Seminar Hall B - Academic Block';
    if (msg.includes('otp') || msg.includes('verify'))
        return '🔐 OTP Help:\n\n• Check your email inbox\n• Also check Spam folder\n• OTP valid for 10 minutes\n• Click "Resend OTP" if needed';
    if (msg.includes('bye') || msg.includes('thanks'))
        return '👋 Goodbye! Have a great time on campus!\n\nDon\'t forget to check out our amazing events! 🎓✨';
    return '🤔 I\'m not sure about that. Try asking:\n\n• "upcoming events"\n• "technical events"\n• "how to register"\n• "venue locations"\n• "help"';
}

function appendChatMsg(role, text) {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `
        <div class="chat-avatar">${role === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>'}</div>
        <div class="chat-bubble">${text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
    `;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function appendTypingIndicator() {
    const msgs = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.id = 'typingIndicator';
    div.innerHTML = `
        <div class="chat-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-bubble">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// ============================================================
// SEARCH
// ============================================================

let searchTimeout;
function globalSearchHandler() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const q = document.getElementById('globalSearch').value.trim().toLowerCase();
        const dropdown = document.getElementById('searchDropdown');
        if (!q) { dropdown.innerHTML = ''; return; }

        const results = (allEvents.length ? allEvents : getDemoEvents())
            .filter(e => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.venue && e.venue.toLowerCase().includes(q)));

        if (!results.length) { dropdown.innerHTML = '<div class="search-item" style="color:#64748b">No events found</div>'; return; }

        dropdown.innerHTML = results.slice(0, 6).map(e => `
            <div class="search-item" onclick="openEventModal(${e.id}); document.getElementById('searchDropdown').innerHTML=''; document.getElementById('globalSearch').value=''">
                <span>${getCategoryIcon(e.category)}</span>
                <div>
                    <strong style="font-size:13px">${e.title}</strong>
                    <div style="font-size:11px;color:#64748b">${e.venue || ''} | ${formatDateShort(e.startDatetime)}</div>
                </div>
            </div>
        `).join('');
    }, 300);
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        document.getElementById('searchDropdown').innerHTML = '';
    }
});

// ============================================================
// API HELPERS
// ============================================================

async function apiGet(url) {
    const res = await fetch(`${API}${url}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
}

async function apiPost(url, data) {
    const res = await fetch(`${API}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Request failed');
    return res.json();
}

async function apiPut(url, data) {
    const res = await fetch(`${API}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(data)
    });
    return res.json();
}

async function apiFetch(method, url) {
    return fetch(`${API}${url}`, {
        method,
        headers: { Authorization: `Bearer ${authToken}` }
    });
}

// ============================================================
// UTILITIES
// ============================================================

function formatDate(dt) {
    if (!dt) return 'TBD';
    const d = new Date(dt);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDateShort(dt) {
    if (!dt) return '';
    return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dt) {
    const diff = Date.now() - new Date(dt).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} day${d > 1 ? 's' : ''} ago`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function getCategoryIcon(cat) {
    const icons = { TECHNICAL: '💻', CULTURAL: '🎭', SPORTS: '⚽', WORKSHOP: '🔧', SEMINAR: '🎤', ACADEMIC: '📚', OTHER: '🎯' };
    return icons[cat] || '📌';
}

function getNotifIcon(type) {
    const icons = { INFO: '<i class="fas fa-info"></i>', SUCCESS: '<i class="fas fa-check"></i>', WARNING: '<i class="fas fa-exclamation"></i>', ALERT: '<i class="fas fa-bell"></i>' };
    return icons[type] || '<i class="fas fa-bell"></i>';
}

function emptyState(msg, icon = 'fas fa-inbox') {
    return `<div class="empty-state" style="grid-column:1/-1">
        <i class="${icon}"></i>
        <h3>${msg}</h3>
        <p>Check back later for updates</p>
    </div>`;
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    toast.className = `toast ${type === 'info' ? '' : type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3500);
}
