/**
 * Auth Logic for Peza Nyumba
 */

const API_URL = 'http://localhost:3000';

const Auth = {
    // Current user state
    user: JSON.parse(localStorage.getItem('peza_user')) || null,
    token: localStorage.getItem('peza_token') || null,

    init() {
        this.updateUI();
        this.checkGuard();
        this.highlightNav();
        if (this.user) this.checkNotifications();
    },

    updateUI() {
        if (!this.user) return;

        const navButtons = document.querySelector('.nav-buttons');
        if (navButtons) {
            // Remove Login/Signup links but preserve other tools like Cart
            const authLinks = navButtons.querySelectorAll('a[href="login.html"], a[href="signup.html"]');
            authLinks.forEach(link => link.remove());

            // Check if profile already exists
            if (!document.getElementById('profile-dropdown')) {
                const profileDiv = document.createElement('div');
                profileDiv.className = 'profile-dropdown';
                profileDiv.id = 'profile-dropdown';
                profileDiv.style.marginLeft = "1rem";

                // Determine profile link based on user role
                const profileLink = this.user.role === 'landlord' ? 'profile-landlord.html' : 'profile-student.html';

                const avatarHtml = this.user.profilePicture
                    ? `<img src="${this.user.profilePicture}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary);">`
                    : `<i class="fa-solid fa-circle-user"></i>`;

                profileDiv.innerHTML = `
                    <div id="nav-avatar-container" style="color: var(--primary); font-size: 1.8rem; display: flex; align-items: center;">
                        ${avatarHtml}
                    </div>
                    <div class="profile-menu" id="profile-menu">
                        <a href="${profileLink}"><i class="fa-solid fa-user"></i> My Profile</a>
                        <a href="${profileLink}#orders"><i class="fa-solid fa-box-open"></i> My Orders</a>
                        <a href="${profileLink}#accommodation" id="nav-favorites-btn"><i class="fa-solid fa-heart"></i> Favorites</a>
                        <hr>
                        <button id="logout-btn-dropdown"><i class="fa-solid fa-right-from-bracket"></i> Log Out</button>
                    </div>
                `;
                navButtons.appendChild(profileDiv);

                // Favorites Button Click - Clear notifications
                document.getElementById('nav-favorites-btn').addEventListener('click', (e) => {
                    this.clearNotifications();
                    // Let the default link behavior take them to the profile/accommodation section
                });

                // Dropdown Toggle
                profileDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.getElementById('profile-menu').classList.toggle('show');
                });

                document.addEventListener('click', () => {
                    const menu = document.getElementById('profile-menu');
                    if (menu) menu.classList.remove('show');
                });

                document.getElementById('logout-btn-dropdown').addEventListener('click', () => this.logout());
            }
        }
    },

    async checkNotifications() {
        if (!this.user || localStorage.getItem('peza_notifications_read') === 'true') return;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(`${API_URL}/reservations/user/${this.user._id}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const reservations = await res.json();

            const hasAvailable = reservations.some(r => r.status === 'available');
            if (hasAvailable) {
                this.showBell();
            }
        } catch (err) { console.log('Backend unavailable'); }
    },

    showBell() {
        const container = document.getElementById('nav-avatar-container');
        if (container && !document.querySelector('.notification-bell')) {
            const bell = document.createElement('div');
            bell.className = 'notification-bell';
            bell.innerHTML = '<i class="fa-solid fa-bell"></i>';
            container.style.position = 'relative';
            container.appendChild(bell);
        }
    },

    clearNotifications() {
        localStorage.setItem('peza_notifications_read', 'true');
        const bell = document.querySelector('.notification-bell');
        if (bell) bell.remove();
    },

    highlightNav() {
        const path = window.location.pathname;
        let page = path.split('/').pop() || 'index.html';

        // Map detail pages to their main category
        if (page === 'listing-detail.html') page = 'listings.html';

        const links = document.querySelectorAll('.nav-links a');

        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.user = data.user;
            this.token = data.accessToken;
            localStorage.setItem('peza_user', JSON.stringify(this.user));
            localStorage.setItem('peza_token', this.token);

            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Auto-login after registration (optional, but requested implicitly)
            return await this.login(userData.email, userData.password);
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('peza_user');
        localStorage.removeItem('peza_token');
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        return !!this.token;
    },

    checkGuard() {
        const restrictedPages = [
            'checkout.html',
            'sell-item.html'
        ];

        const path = window.location.pathname;
        const currentPage = path.split('/').pop();

        if (restrictedPages.includes(currentPage) && !this.isAuthenticated()) {
            // Use search params to redirect back after login
            window.location.href = `login.html?redirect=${currentPage}${window.location.search}`;
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Auth.init());
window.PezaAuth = Auth;
