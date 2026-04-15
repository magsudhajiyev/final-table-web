// Firebase configuration and initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDTw_1lOHmIl_gDY3ex-N_l8NLxRzy6AtA",
    authDomain: "poker-tracker-52df8.firebaseapp.com",
    databaseURL: "https://poker-tracker-52df8-default-rtdb.firebaseio.com",
    projectId: "poker-tracker-52df8",
    storageBucket: "poker-tracker-52df8.firebasestorage.app",
    messagingSenderId: "311745459306",
    appId: "1:311745459306:web:4d53385d198139f8d00613",
    measurementId: "G-GZND8S84WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase database functions
window.submitToWaitlist = async function(email) {
    try {
        await addDoc(collection(db, 'waitlist'), {
            email: email,
            source: 'final-table',
            timestamp: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error adding document: ', error);
        return false;
    }
};

window.submitContactForm = async function(name, email, message) {
    try {
        await addDoc(collection(db, 'contact_submissions'), {
            name: name,
            email: email,
            message: message,
            source: 'final-table',
            timestamp: serverTimestamp(),
            status: 'new'
        });
        return true;
    } catch (error) {
        console.error('Error adding contact form submission: ', error);
        return false;
    }
};

// ==========================================
// Lenis Smooth Scrolling
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                if (target && target !== '#' && document.querySelector(target)) {
                    lenis.scrollTo(target);
                }
            });
        });
    }

    // ==========================================
    // Theme Toggle
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (sunIcon && moonIcon) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');

            if (isDark) {
                localStorage.setItem('theme', 'dark');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            } else {
                localStorage.setItem('theme', 'light');
                if (sunIcon && moonIcon) {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                }
            }
        });
    }

    // ==========================================
    // Scroll Reveal (Intersection Observer)
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elementsToObserve = document.querySelectorAll('.observe-me');
    elementsToObserve.forEach(el => observer.observe(el));

    // ==========================================
    // Dynamic Chart Animation
    // ==========================================
    const chartBars = document.querySelectorAll('.fake-chart .bar');
    if (chartBars.length > 0) {
        chartBars.forEach(bar => {
            bar.dataset.targetHeight = bar.style.height;
            bar.style.height = '0%';
        });

        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    chartBars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.height = bar.dataset.targetHeight;
                        }, index * 150);
                    });
                    chartObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });

        const chartContainer = document.querySelector('.fake-chart');
        if (chartContainer) {
            chartObserver.observe(chartContainer);
        }
    }

    // ==========================================
    // Hero 3D Scroll Effect
    // ==========================================
    const heroContainer = document.querySelector('.hero');
    const headerContent = document.querySelector('.hero-content');
    const mockupCard = document.querySelector('.app-screenshot');

    function mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    function update3DScroll() {
        if (!heroContainer || !headerContent || !mockupCard) return;

        const scrollY = window.scrollY;
        const maxScroll = Math.max(window.innerHeight * 0.9, 800);

        let progress = scrollY / maxScroll;
        if (progress > 1) progress = 1;
        if (progress < 0) progress = 0;

        const isMobile = window.innerWidth <= 768;

        const headerTranslate = mapRange(progress, 0, 1, 0, -100);
        const cardRotateX = mapRange(progress, 0, 1, 20, 0);

        const scaleStart = isMobile ? 0.7 : 1.05;
        const scaleEnd = isMobile ? 0.9 : 1;
        const cardScale = mapRange(progress, 0, 1, scaleStart, scaleEnd);

        headerContent.style.transform = `translateY(${headerTranslate}px)`;
        mockupCard.style.transform = `rotateX(${cardRotateX}deg) scale(${cardScale})`;
    }

    window.addEventListener('scroll', () => {
        requestAnimationFrame(update3DScroll);
    });
    window.addEventListener('resize', update3DScroll);
    update3DScroll();

    // ==========================================
    // Waitlist Form Submission
    // ==========================================
    const waitlistForm = document.getElementById('waitlistForm');
    const emailInput = document.getElementById('emailInput');
    const submitButton = document.getElementById('submitButton');
    const waitlistNote = document.getElementById('waitlistNote');

    if (waitlistForm) {
        waitlistForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = emailInput.value.trim();
            if (!email) return;

            submitButton.disabled = true;
            submitButton.classList.add('loading');

            try {
                const success = await window.submitToWaitlist(email);

                if (success) {
                    submitButton.classList.add('success');
                    waitlistNote.textContent = 'Thanks for joining! We\'ll notify you when we launch.';
                    waitlistNote.classList.add('success-message');
                    emailInput.value = '';
                    emailInput.placeholder = 'Email submitted successfully!';
                } else {
                    submitButton.disabled = false;
                    submitButton.classList.remove('loading');
                    waitlistNote.textContent = 'Something went wrong. Please try again.';
                    waitlistNote.classList.add('error-message');

                    setTimeout(() => {
                        waitlistNote.textContent = 'Be the first to know when we launch. No spam, ever.';
                        waitlistNote.classList.remove('error-message');
                    }, 3000);
                }
            } catch (error) {
                console.error('Submission error:', error);
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    }

    // ==========================================
    // Contact Form Submission
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();

            if (!name || !email || !message) return;

            const contactSubmitBtn = contactForm.querySelector('.contact-submit-button');
            const originalText = contactSubmitBtn.innerHTML;

            contactSubmitBtn.disabled = true;
            contactSubmitBtn.classList.add('loading');

            try {
                const success = await window.submitContactForm(name, email, message);

                if (success) {
                    contactSubmitBtn.classList.remove('loading');
                    contactSubmitBtn.classList.add('success');

                    setTimeout(() => {
                        contactForm.innerHTML = `
                            <div style="text-align: center; padding: 2rem 0;">
                                <div style="font-size: 3rem; margin-bottom: 1rem;">&#10003;</div>
                                <h3 style="color: #000; margin-bottom: 1rem; font-size: 1.5rem;">Thank you for your message!</h3>
                                <p style="color: #333; margin: 0; font-size: 1rem;">We will get back to you shortly.</p>
                            </div>
                        `;
                    }, 500);
                } else {
                    throw new Error('Failed to submit contact form');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                contactSubmitBtn.disabled = false;
                contactSubmitBtn.classList.remove('loading');
                contactSubmitBtn.innerHTML = originalText;
                alert('Something went wrong. Please try again.');
            }
        });
    }

    // ==========================================
    // Mobile Hamburger Menu
    // ==========================================
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', function() {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');

            if (mobileNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        mobileNav.addEventListener('click', function(e) {
            if (e.target === mobileNav) {
                hamburgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});
