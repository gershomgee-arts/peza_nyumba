// 1. Loader Logic - Run immediately, don't wait for DOMContentLoaded
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
}, 2000); // Show for 2 seconds max

document.addEventListener('DOMContentLoaded', () => {

    // 2. Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isActive = navLinks.classList.contains('active');
            menuBtn.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : 'auto';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
                document.body.style.overflow = 'auto';
            });
        });
    }

    // 3. Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, h2, p').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // 4. Accommodation Filtering Logic
    const filterForm = document.getElementById('listing-filters');
    const listingsGrid = document.querySelector('.grid.grid-3');

    if (filterForm && listingsGrid) {
        const listings = Array.from(listingsGrid.querySelectorAll('.listing-card'));

        // Function to apply filters
        const applyFilters = () => {
            const university = filterForm.querySelector('select:nth-of-type(1)').value.toLowerCase();
            const location = filterForm.querySelector('input[type="text"]').value.toLowerCase();
            const type = filterForm.querySelector('select:nth-of-type(2)').value.toLowerCase();
            const maxPrice = parseInt(filterForm.querySelector('input[type="range"]').value);

            listings.forEach(card => {
                const cardUni = card.querySelector('.listing-uni').innerText.toLowerCase();
                const cardTitle = card.querySelector('h3').innerText.toLowerCase();
                const cardPriceText = card.querySelector('.listing-price').innerText;
                const cardPrice = parseInt(cardPriceText.replace(/[^\d]/g, ''));
                const cardLoc = card.querySelector('p').innerText.toLowerCase();

                let match = true;

                if (university !== 'all' && !cardUni.includes(university)) match = false;
                if (location && !cardLoc.includes(location) && !cardTitle.includes(location)) match = false;
                if (cardPrice > maxPrice) match = false;

                // For room type, we'd ideally have data attributes, but we'll mock it based on title
                if (type !== 'any') {
                    if (type === 'shared' && !cardTitle.includes('shared')) match = false;
                    if (type === 'single' && !cardTitle.includes('single') && !cardTitle.includes('hostel')) match = false;
                }

                card.style.display = match ? 'block' : 'none';
            });

            // Update range label if exists
            const rangeLabel = filterForm.querySelector('label[for="price-range"]');
            if (rangeLabel) rangeLabel.innerText = `Max Price: K${maxPrice}`;
        };

        // Listen for changes
        filterForm.addEventListener('input', applyFilters);
        filterForm.querySelector('button').addEventListener('click', applyFilters);

        // Parse URL params for landing page search
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('university')) {
            filterForm.querySelector('select:nth-of-type(1)').value = urlParams.get('university');
        }
        if (urlParams.has('location')) {
            filterForm.querySelector('input[type="text"]').value = urlParams.get('location');
        }
        if (urlParams.has('maxPrice')) {
            filterForm.querySelector('input[type="range"]').value = urlParams.get('maxPrice');
        }

        applyFilters(); // Run once on load
    }

    // 5. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        revealElements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
