// assets/js/main.js
// Consolidated, robust script for Devil Barewar site
// - mobile inline nav fallback
// - bottom-sheet menu (overlay + focus + scroll-lock)
// - posts loading from data/posts.json + in-page filtering
// - search form (redirect fallback)
// - newsletter/contact placeholder handlers
// - back-to-top button
// - simple slider (safe guards)
// No globals exposed.

(function () {
    'use strict';

    // helpers
    const $ = (sel, ctx = document) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function throttle(fn, wait) {
        let t = null;
        return function () {
            if (t) return;
            const args = arguments;
            const ctx = this;
            t = setTimeout(() => {
                t = null;
                fn.apply(ctx, args);
            }, wait);
        };
    }

    // safe "open in new tab" helper (uses window.open)
    function openInNewTab(url) {
        try {
            window.open(url, '_blank', 'noopener');
        } catch (e) {
            // fallback: change location (rare)
            window.location.href = url;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        // elements (may be missing on some pages)
        const navToggle = $('.nav-toggle');
        const nav = $('.main-nav');
        const rightControls = $('.right-controls');

        const postsContainer = document.getElementById('posts');
        const siteSearchForm = document.getElementById('site-search');
        const backBtn = document.getElementById('back-to-top');

        const menuToggle = document.getElementById('menu-toggle') || navToggle; // menu toggle (bottom menu or fallback)
        const bottomMenu = document.getElementById('bottom-menu');
        const menuOverlay = document.getElementById('menu-overlay');
        const menuClose = document.getElementById('menu-close');

        // --- inline mobile nav (legacy) ---
        function openMobileNav() {
            if (!nav || !navToggle) return;
            nav.classList.add('open');
            nav.style.display = 'flex';
            nav.style.flexDirection = 'column';
            nav.style.background = '#fff';
            nav.style.padding = '0.6rem';
            nav.style.borderRadius = '6px';
            nav.style.position = 'absolute';
            nav.style.right = '1rem';
            nav.style.top = '56px';
            nav.setAttribute('aria-expanded', 'true');
            navToggle.setAttribute('aria-pressed', 'true');
        }
        function closeMobileNav() {
            if (!nav || !navToggle) return;
            nav.classList.remove('open');
            nav.style.display = '';
            nav.style.removeProperty('flex-direction');
            nav.style.removeProperty('background');
            nav.style.removeProperty('padding');
            nav.style.removeProperty('position');
            nav.style.removeProperty('right');
            nav.style.removeProperty('top');
            nav.removeAttribute('aria-expanded');
            navToggle.setAttribute('aria-pressed', 'false');
        }

        // Bind inline nav toggle only if bottomMenu is not present (fallback)
        if (navToggle && nav && !bottomMenu) {
            navToggle.addEventListener('click', function (e) {
                if (nav.classList.contains('open')) closeMobileNav();
                else openMobileNav();
            });

            navToggle.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navToggle.click();
                } else if (e.key === 'Escape') {
                    closeMobileNav();
                }
            });
        }

        // close inline nav on outside click (mobile)
        document.addEventListener('click', function (e) {
            if (!nav || !nav.classList.contains('open')) return;
            if (window.innerWidth > 980) return;
            const inside = e.target.closest('.right-controls');
            if (!inside) closeMobileNav();
        });
        // close on resize
        window.addEventListener('resize', function () {
            if (window.innerWidth > 980 && nav && nav.classList.contains('open')) closeMobileNav();
        });

        // --- posts loading (single, consistent implementation) ---
        // Handles: homepage preview and full listing on story.html / stories.html
        if (postsContainer) {
            const path = (window.location.pathname || '').toLowerCase();
            const isHome = (path === '/' || path.endsWith('/index.html') || path === '');
            const isStoryPage = path.endsWith('/story.html') || path.endsWith('story.html') ||
                path.endsWith('/stories.html') || path.endsWith('stories.html');

            // If this is the story listing page, hide the right-side subscribe box
            if (isStoryPage) {
                const sidebarSub = document.getElementById('newsletter-form');
                if (sidebarSub) sidebarSub.remove();
            }

            fetch('assets/data/posts.json', { cache: 'no-store' })
                .then(resp => {
                    if (!resp.ok) throw new Error('posts.json not found');
                    return resp.json();
                })
                .then(data => {
                    const all = Array.isArray(data) ? data : [];
                    postsContainer._posts = all;

                    if (isHome) postsContainer.classList.add('home-preview');
                    else postsContainer.classList.remove('home-preview');

                    // HOME: show up to 8 latest
                    if (isHome) {
                        renderPosts(all.slice(0, 8), { isHome: true, allCount: all.length, homeLimit: 8 });
                    } else {
                        // STORY LISTING: show all
                        renderPosts(all, { isHome: false, allCount: all.length });
                    }
                })
                .catch(err => {
                    console.warn('Could not load posts.json', err);
                    postsContainer.innerHTML = '<p class="muted">No posts found.</p>';
                });
        }

        function renderPosts(list, opts = {}) {
            if (!postsContainer) return;
            postsContainer.innerHTML = '';
            const { isHome = false, allCount = 0, homeLimit = 8 } = opts;

            if (!list || list.length === 0) {
                postsContainer.innerHTML = '<p class="muted">No posts found.</p>';
                return;
            }

            list.forEach(post => {
                const el = document.createElement('article');
                el.className = 'post-card';

                const thumbHtml = post.image ? `
          <div class="post-thumb">
            <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title || '')}" loading="lazy" />
          </div>` : '';

                el.innerHTML = `
          ${thumbHtml}
          <div class="post-card-body">
            <h3 class="post-title"><a href="${escapeHtml(post.url || '#')}">${escapeHtml(post.title || 'Untitled')}</a></h3>
            <p class="muted post-date">${escapeHtml(post.date || '')}</p>
            <p class="post-excerpt">${escapeHtml(post.excerpt || '')}</p>
          </div>
        `;

                // stack layout for home preview
                if (isHome) {
                    el.style.display = 'flex';
                    el.style.flexDirection = 'column';
                    el.style.alignItems = 'stretch';

                    const thumb = el.querySelector('.post-thumb');
                    const img = el.querySelector('.post-thumb img');
                    if (thumb) {
                        thumb.style.width = '100%';
                        thumb.style.flex = '0 0 auto';
                        // no fixed height; let image decide
                        thumb.style.overflow = 'hidden';
                        thumb.style.display = 'block';
                    }
                    if (img) {
                        img.style.width = '100%';
                        img.style.height = 'auto';      // keep aspect ratio
                        img.style.objectFit = 'contain'; // show full image
                        img.style.display = 'block';
                    }


                    const body = el.querySelector('.post-card-body');
                    if (body) body.style.paddingTop = '.8rem';
                }

                postsContainer.appendChild(el);
            });

            // "View more" card on home if extra posts exist
            if (isHome && allCount > homeLimit) {
                const more = document.createElement('div');
                more.className = 'post-card view-more-card view-more';
                more.innerHTML = `
          <a href="story.html" class="view-more-link" style="display:inline-block;">
            View more stories
          </a>
        `;
                const link = more.querySelector('a.view-more-link');
                if (link) {
                    link.addEventListener('click', function (ev) {
                        ev.preventDefault();
                        window.location.href = this.getAttribute('href') || 'story.html';
                    });
                }
                postsContainer.appendChild(more);
            }
        }

        // --- Delegated click handler for anchors inside #posts ---
        if (postsContainer && !postsContainer.__navBound) {
            postsContainer.__navBound = true;
            postsContainer.addEventListener('click', function (e) {
                const a = e.target.closest('a');
                if (!a) return;
                const href = (a.getAttribute('href') || '').trim();
                if (!href) return;

                const isExternal = href.startsWith('http://') || href.startsWith('https://');
                if (isExternal) return;
                if (href.startsWith('#') || href.toLowerCase().startsWith('javascript:')) return;

                const localTargets = [
                    'story.html', 'stories.html', 'stories',
                    'poems.html', 'poems',
                    'books.html', 'books',
                    'story1.html', 'story2.html'
                ];
                const lower = href.toLowerCase();

                const shouldNavigate = localTargets.some(t =>
                    lower.endsWith(t) || lower.indexOf('/' + t) !== -1 || lower === t
                );

                if (shouldNavigate) {
                    e.preventDefault();
                    window.location.href = href;
                }
            });
        }

        // --- sticky notes behavior ---
        (function bindStickyNotes() {
            const stickies = document.querySelectorAll('.sticky');
            if (!stickies || !stickies.length) return;
            stickies.forEach(note => {
                const cat = (note.dataset && note.dataset.category) ? note.dataset.category.trim() : (note.textContent || '').trim();

                note.addEventListener('click', function (ev) {
                    ev.stopPropagation();
                    if (!cat) return;
                    const c = cat.toLowerCase();
                    if (c.indexOf('book') !== -1) {
                        window.location.href = 'books.html';
                        return;
                    }
                    try {
                        if (typeof window.openStickyModal === 'function') {
                            window.openStickyModal(cat);
                            return;
                        }
                        if (typeof window.openModal === 'function') {
                            window.openModal(cat);
                            return;
                        }
                    } catch (e) { }
                    const href = note.getAttribute('data-href') || note.getAttribute('href');
                    if (href) {
                        window.location.href = href;
                    }
                });
            });
        })();

        // --- search ---
        if (siteSearchForm) {
            if (!siteSearchForm.__bound) {
                siteSearchForm.__bound = true;
                siteSearchForm.addEventListener('submit', function (e) {
                    const qInput = $('#q', siteSearchForm);
                    const q = qInput ? qInput.value.trim() : '';
                    if (!q) {
                        e.preventDefault();
                        qInput && qInput.focus();
                        return;
                    }
                    if (postsContainer && postsContainer._posts && postsContainer._posts.length) {
                        e.preventDefault();
                        const lower = q.toLowerCase();
                        const filtered = postsContainer._posts.filter(p => {
                            const hay = `${p.title} ${p.excerpt} ${p.date} ${p.tags || ''}`.toLowerCase();
                            return hay.indexOf(lower) !== -1;
                        });
                        renderPosts(filtered, { isHome: false });
                        postsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        const action = siteSearchForm.getAttribute('action') || '/search.html';
                        if (action.indexOf('search.html') !== -1) {
                            e.preventDefault();
                            window.location.href = '/search.html?q=' + encodeURIComponent(q);
                        }
                    }
                });
            }
        }

        // --- back to top ---
        if (backBtn) {
            const SHOW_AT = 200;
            function checkScroll() {
                if (window.scrollY > SHOW_AT) backBtn.classList.add('visible');
                else backBtn.classList.remove('visible');
            }
            backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
            document.addEventListener('scroll', throttle(checkScroll, 100));
            checkScroll();
        }

        // --- newsletter / contact placeholders ---
        function bindNewsletter(formId, inputId) {
            const form = document.getElementById(formId);
            if (!form || form.__bound) return;
            form.__bound = true;
            form.addEventListener('submit', function (ev) {
                ev.preventDefault();
                const input = document.getElementById(inputId);
                const email = input ? input.value.trim() : '';
                if (!email) {
                    if (input) {
                        input.focus();
                        flashMsg(form, 'Please enter a valid email.', true);
                    }
                    return;
                }
                input.value = '';
                flashMsg(form, 'Thanks — subscription recorded (demo).');
            });
        }

        function flashMsg(formEl, message) {
            const msg = document.createElement('div');
            msg.className = 'muted';
            msg.style.marginTop = '.6rem';
            msg.textContent = message;
            formEl.appendChild(msg);
            setTimeout(() => msg.remove(), 4500);
        }

        bindNewsletter('newsletter-form', 'email');
        bindNewsletter('footer-newsform', 'footer-email');
        bindNewsletter('footer-newsletter', 'footer-email');
        bindNewsletter('bottom-newsletter', 'bottom-email');

        const contactForm = document.getElementById('contact-form');
        if (contactForm && !contactForm.__bound) {
            contactForm.__bound = true;
            contactForm.addEventListener('submit', function (ev) {
                ev.preventDefault();
                const name = contactForm.querySelector('input[name="name"]')?.value.trim();
                const email = contactForm.querySelector('input[name="email"]')?.value.trim();
                const message = contactForm.querySelector('textarea[name="message"]')?.value.trim();
                if (!name || !email || !message) {
                    flashMsg(contactForm, 'Please complete all fields before submitting.', true);
                    return;
                }
                contactForm.reset();
                flashMsg(contactForm, 'Thanks — your message was recorded (demo).');
            });
        }

        (function bindFooterSocialLinks() {
            const footerSocial = document.querySelector('.social-icons') || document.querySelector('.footer-social');
            if (!footerSocial || footerSocial.__bound) return;
            footerSocial.__bound = true;
            footerSocial.addEventListener('click', function (e) {
                const a = e.target.closest('a');
                if (!a) return;
                const href = a.getAttribute('href') || '';
                const isExternal = href.startsWith('http://') || href.startsWith('https://');
                if (isExternal) {
                    e.preventDefault();
                    openInNewTab(href);
                }
            });
        })();

        // key handling
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                if (nav && nav.classList.contains('open')) closeMobileNav();
                if (bottomMenu && bottomMenu.classList.contains('open')) closeBottomMenu();
            }
        });

        // bottom-sheet menu
        function openBottomMenu() {
            if (!bottomMenu || !menuOverlay) return;
            bottomMenu.classList.add('open');
            menuOverlay.classList.add('visible');
            bottomMenu.setAttribute('aria-hidden', 'false');
            menuOverlay.setAttribute('aria-hidden', 'false');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                const first = bottomMenu.querySelector('a,button,input');
                first && first.focus();
            }, 60);
        }
        function closeBottomMenu() {
            if (!bottomMenu || !menuOverlay) return;
            bottomMenu.classList.remove('open');
            menuOverlay.classList.remove('visible');
            bottomMenu.setAttribute('aria-hidden', 'true');
            menuOverlay.setAttribute('aria-hidden', 'true');
            if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (menuToggle) menuToggle.focus();
        }

        if (menuToggle && bottomMenu && menuOverlay) {
            if (!menuToggle.__bound) {
                menuToggle.__bound = true;
                menuToggle.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const isOpen = bottomMenu.classList.contains('open');
                    if (isOpen) closeBottomMenu();
                    else openBottomMenu();
                });
            }

            if (menuClose && !menuClose.__bound) {
                menuClose.__bound = true;
                menuClose.addEventListener('click', closeBottomMenu);
            }

            if (!menuOverlay.__bound) {
                menuOverlay.__bound = true;
                menuOverlay.addEventListener('click', closeBottomMenu);
            }

            if (!bottomMenu.__bound) {
                bottomMenu.__bound = true;
                bottomMenu.addEventListener('click', function (e) {
                    const a = e.target.closest('a');
                    if (!a) return;
                    const href = a.getAttribute('href') || '';
                    const isExternal = href.startsWith('http://') || href.startsWith('https://');
                    const hasBlank = (a.getAttribute('target') || '').toLowerCase() === '_blank';
                    if (isExternal && !hasBlank) {
                        e.preventDefault();
                        openInNewTab(href);
                        setTimeout(closeBottomMenu, 120);
                        return;
                    }
                    const isLocal = href.startsWith('/') || href.startsWith(window.location.origin) || href.startsWith(window.location.pathname) || href.startsWith('#');
                    if (isLocal) {
                        setTimeout(closeBottomMenu, 120);
                    }
                });
            }
        }

        document.addEventListener('click', function (e) {
            const a = e.target.closest('a[data-external="true"]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (href) {
                e.preventDefault();
                openInNewTab(href);
            }
        });

        (function bindStickyLinks() {
            try {
                const stickies = document.querySelectorAll('.sticky');
                if (!stickies || !stickies.length) return;
                stickies.forEach(st => {
                    if (st.__boundNavigate) return;
                    st.__boundNavigate = true;

                    st.addEventListener('click', function (ev) {
                        const clickedLink = ev.target.closest('a[href]');
                        if (clickedLink) return;

                        const dh = st.getAttribute('data-href');
                        if (dh) {
                            window.location.href = dh;
                            return;
                        }

                        const innerA = st.querySelector('a[href]');
                        if (innerA) {
                            const href = innerA.getAttribute('href');
                            if (href) {
                                window.location.href = href;
                                return;
                            }
                        }
                    }, { passive: true });
                });
            } catch (err) {
                console.warn('sticky link binder failed', err);
            }
        })();

    }); // DOMContentLoaded
})(); // main IIFE

// ============================
// SIMPLE AUTO SLIDER (5 sec)
// ============================
(function () {
    'use strict';
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (!slides || slides.length === 0) return;

    let index = 0;
    const safeShowSlide = (i) => {
        const idx = (typeof i === 'number') ? (i % slides.length + slides.length) % slides.length : 0;
        slides.forEach((s, si) => s.classList.toggle('active', si === idx));
        if (dots && dots.length) {
            dots.forEach((d, di) => d.classList.toggle('active', di === idx));
        }
        index = idx;
    };

    function nextSlide() {
        safeShowSlide(index + 1);
    }

    let slideInterval = setInterval(nextSlide, 5000);
    safeShowSlide(0);

    if (dots && dots.length) {
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const ds = dot.dataset && dot.dataset.slide;
                const n = ds ? parseInt(ds, 10) : Array.prototype.indexOf.call(dots, dot);
                if (!Number.isNaN(n)) {
                    safeShowSlide(n);
                    clearInterval(slideInterval);
                    slideInterval = setInterval(nextSlide, 5000);
                }
            });
        });
    }
})();
