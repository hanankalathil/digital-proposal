document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // ----------------------------------------------------
    // POPULATE CONTENT FROM CONFIG
    // ----------------------------------------------------
    
    document.getElementById('bg-music').src = CONFIG.music.src;
    
    document.getElementById('hero-img').src = CONFIG.hero.photoSrc;
    document.getElementById('hero-small').innerText = CONFIG.hero.captionSmall;
    document.getElementById('hero-large').innerText = CONFIG.hero.captionLarge;
    
    document.getElementById('gallery-text-1').innerText = CONFIG.galleryText.group1;
    document.getElementById('gallery-text-2').innerText = CONFIG.galleryText.group2;
    
    // Timeline
    const timelineContainer = document.getElementById('timeline-container');
    CONFIG.timeline.forEach(item => {
        const eventHtml = `
            <div class="timeline-event reveal-on-scroll">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${item.date}</div>
                    <p>${item.description}</p>
                    <img src="${item.photoSrc}" alt="${item.date}" class="timeline-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\' width=\\\'300\\\' height=\\\'200\\\'><rect width=\\\'100%\\\' height=\\\'100%\\\' fill=\\\'%23E8DFD5\\\'/></svg>'">
                </div>
            </div>
        `;
        timelineContainer.insertAdjacentHTML('beforeend', eventHtml);
    });

    document.getElementById('letter-title').innerText = CONFIG.letter.title;
    document.getElementById('letter-btn').innerText = CONFIG.letter.buttonText;
    
    document.getElementById('envelope-prompt').innerText = CONFIG.surprise.prompt;
    document.getElementById('envelope-paper').innerText = CONFIG.surprise.message;
    
    document.getElementById('final-img').src = CONFIG.final.photoSrc;
    document.getElementById('final-text-1').innerText = CONFIG.final.textLine1;
    document.getElementById('final-emoji').innerText = CONFIG.final.emoji;
    document.getElementById('final-text-2').innerText = CONFIG.final.textLine2;


    // ----------------------------------------------------
    // SCRATCH REVEAL LOGIC
    // ----------------------------------------------------
    const scratchConfig = CONFIG.scratchReveal || {};
    if (!scratchConfig.enabled) {
        document.getElementById('landing').style.display = 'none';
    } else {
        // Populate config
        document.getElementById('landing-small-intro').innerText = scratchConfig.introSmall;
        document.getElementById('landing-title').innerText = scratchConfig.heading;
        document.getElementById('landing-support-text').innerText = scratchConfig.supportText;
        document.getElementById('scratch-instruction').innerText = scratchConfig.instruction;
        document.getElementById('memory-photo').src = scratchConfig.hiddenPhoto;
        document.getElementById('memory-message').innerText = scratchConfig.personalMessage;
        document.getElementById('memory-caption').innerText = scratchConfig.caption;
        document.getElementById('memory-date').innerText = scratchConfig.date;
        document.getElementById('landing-continue-btn').innerText = scratchConfig.continueBtnText;
        document.getElementById('landing-back-btn').innerText = scratchConfig.backBtnText;

        const landing = document.getElementById('landing');
        const canvas = document.getElementById('scratch-canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: true });
        const container = document.getElementById('scratch-card-container');
        const instruction = document.getElementById('scratch-instruction');
        const progressFill = document.getElementById('scratch-progress-fill');
        const progressText = document.getElementById('scratch-progress-text');
        const progressContainer = document.getElementById('scratch-progress-container');
        const continueBtn = document.getElementById('landing-continue-btn');
        const skipBtn = document.getElementById('reveal-skip-btn');
        
        let isDrawing = false;
        let isRevealed = false;
        let isAutoRevealing = false;
        let autoFrame = 0;
        let hasStarted = false;
        let lastPos = null;
        let pendingPos = null;
        let frame = 0;
        let lastCheck = 0;
        let lastPercent = -1;
        let resizeTimer;
        const brushRadius = 35;
        const brush = document.createElement('canvas');
        brush.width = brush.height = brushRadius * 2;
        const brushCtx = brush.getContext('2d');
        const grad = brushCtx.createRadialGradient(brushRadius, brushRadius, 5, brushRadius, brushRadius, brushRadius);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        brushCtx.fillStyle = grad;
        brushCtx.fillRect(0, 0, brush.width, brush.height);
        canvas.style.touchAction = 'none';

        function initCanvas() {
            if (isRevealed || hasStarted) return; // preserve progress and avoid mobile address-bar resizes
            const w = container.clientWidth, h = container.clientHeight;
            if (!w || !h) return;
            // Cap backing resolution to avoid expensive full-size pixel reads on high-DPI phones.
            const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
            canvas.width = Math.round(w * ratio);
            canvas.height = Math.round(h * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#EBE6DF';
            ctx.fillRect(0, 0, w, h);
            // Light texture once, rather than repeatedly drawing expensive gradients per touch.
            for (let i = 0; i < 180; i++) {
                ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.018)' : 'rgba(255,255,255,.035)';
                ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
            }
        }
        initCanvas();
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initCanvas, 180);
        }, { passive: true });

        function getPosition(e) {
            const rect = canvas.getBoundingClientRect();
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        function stamp(x, y) {
            ctx.drawImage(brush, x - brushRadius, y - brushRadius);
        }
        function paint() {
            frame = 0;
            if (!pendingPos || isRevealed) return;
            const pos = pendingPos;
            pendingPos = null;
            if (!lastPos) lastPos = pos;
            const dx = pos.x - lastPos.x, dy = pos.y - lastPos.y;
            const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 12));
            ctx.globalCompositeOperation = 'destination-out';
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                stamp(lastPos.x + dx * t, lastPos.y + dy * t);
            }
            lastPos = pos;
            // Read pixels at most four times a second instead of on every touch event.
            const now = performance.now();
            if (now - lastCheck > 250) {
                lastCheck = now;
                checkCompletion();
            }
        }
        function queuePaint(pos) {
            if (isRevealed) return;
            pendingPos = pos;
            if (!frame) frame = requestAnimationFrame(paint);
        }
        function checkCompletion() {
            if (isRevealed || !canvas.width || !canvas.height) return;
            // Downsample before reading: small image means much less CPU/memory work.
            const sample = document.createElement('canvas');
            sample.width = 48; sample.height = 48;
            const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
            sampleCtx.drawImage(canvas, 0, 0, 48, 48);
            const data = sampleCtx.getImageData(0, 0, 48, 48).data;
            let transparent = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i] < 128) transparent++;
            const percent = Math.min(100, Math.round(transparent / (data.length / 4) * 100));
            if (percent !== lastPercent) {
                progressFill.style.width = percent + '%';
                progressText.textContent = percent + '% revealed';
                lastPercent = percent;
            }
            if (percent >= scratchConfig.revealThreshold) autoFinishScratch();
        }
        // Once 30% is scratched, finish the card automatically with a smooth
        // lightweight wipe. Only one animation runs, even during rapid touches.
        function autoFinishScratch() {
            if (isRevealed || isAutoRevealing) return;
            isAutoRevealing = true;
            isDrawing = false;
            pendingPos = null;
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650;
            const start = performance.now();
            function wipe(now) {
                if (isRevealed) return;
                const t = duration ? Math.min(1, (now - start) / duration) : 1;
                const eased = 1 - Math.pow(1 - t, 3);
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, Math.ceil(canvas.height * eased));
                ctx.restore();
                progressFill.style.width = (30 + Math.round(70 * eased)) + '%';
                progressText.textContent = (30 + Math.round(70 * eased)) + '% revealed';
                if (t < 1) autoFrame = requestAnimationFrame(wipe);
                else { autoFrame = 0; revealMemory(); }
            }
            autoFrame = requestAnimationFrame(wipe);
        }
        function revealMemory() {
            if (isRevealed) return;
            isRevealed = true;
            if (autoFrame) cancelAnimationFrame(autoFrame);
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            pendingPos = null;
            document.body.style.overflow = '';
            canvas.style.opacity = '0';
            instruction.style.opacity = '0';
            progressContainer.style.opacity = '0';
            setTimeout(() => progressContainer.style.display = 'none', 500);
            container.classList.add('revealed');
            skipBtn.style.opacity = '0';
            setTimeout(() => {
                skipBtn.style.display = 'none';
                continueBtn.style.display = 'block';
                requestAnimationFrame(() => continueBtn.classList.add('visible'));
            }, 500);
            setTimeout(() => canvas.style.display = 'none', 1000);
        }
        canvas.addEventListener('pointerdown', e => {
            if (isRevealed || isAutoRevealing) return;
            isDrawing = true;
            hasStarted = true;
            instruction.style.opacity = '0';
            canvas.setPointerCapture(e.pointerId);
            lastPos = getPosition(e);
            queuePaint(lastPos);
        });
        canvas.addEventListener('pointermove', e => {
            if (!isDrawing || isRevealed || isAutoRevealing) return;
            queuePaint(getPosition(e));
        });
        function endScratch() {
            if (!isDrawing || isAutoRevealing) return;
            isDrawing = false;
            if (frame) { cancelAnimationFrame(frame); frame = 0; }
            if (pendingPos) paint();
            lastPos = null;
            checkCompletion();
        }
        canvas.addEventListener('pointerup', endScratch);
        canvas.addEventListener('pointercancel', endScratch);
        canvas.addEventListener('lostpointercapture', endScratch);

        // Skip reveal button
        skipBtn.addEventListener('click', revealMemory);

        // Continue Button
        continueBtn.addEventListener('click', () => {
            landing.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            
            // Auto-scroll to top smoothly so the hero section is perfectly in view
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            toggleMusic(); // start music
            // Show a clearly visible gesture independent of available scroll distance.
            // Keep it visible long enough to notice on slower mobile browsers.
            const swipeHint = document.getElementById('swipe-hint');
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            let hintTimer;
            const hideHint = () => {
                clearTimeout(hintTimer);
                if (swipeHint) {
                    swipeHint.classList.remove('is-visible');
                    setTimeout(() => { if (!swipeHint.classList.contains('is-visible')) swipeHint.hidden = true; }, 350);
                }
                ['touchstart','wheel','pointerdown','keydown'].forEach(type =>
                    window.removeEventListener(type, hideHint));
            };
            if (swipeHint && !reducedMotion) {
                setTimeout(() => {
                    swipeHint.hidden = false;
                    // Restart CSS animation reliably after each Continue tap.
                    swipeHint.classList.remove('is-visible');
                    void swipeHint.offsetWidth;
                    requestAnimationFrame(() => swipeHint.classList.add('is-visible'));
                    ['touchstart','wheel','pointerdown','keydown'].forEach(type =>
                        window.addEventListener(type, hideHint, { passive:true, once:true }));
                    hintTimer = setTimeout(hideHint, 4900);
                }, 850);
            }
            setTimeout(() => {
                landing.style.display = 'none';
            }, 1500);
        });
        
        // Back Button (Optional logic, e.g. hide for now or reload)
        document.getElementById('landing-back-btn').addEventListener('click', () => {
            // Could go somewhere else if needed.
        });
    }

    // ----------------------------------------------------
    // LANDING & MUSIC LOGIC
    // ----------------------------------------------------
    const landing = document.getElementById('landing');
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const musicStatus = document.getElementById('music-status');

    let isPlaying = false;

    function toggleMusic() {
        if (isPlaying) {
            bgMusic.pause();
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            musicStatus.classList.add('paused');
        } else {
            bgMusic.play().catch(e => console.log("Autoplay blocked"));
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            musicStatus.classList.remove('paused');
        }
        isPlaying = !isPlaying;
    }

    musicToggle.addEventListener('click', toggleMusic);

    // ----------------------------------------------------
    // SCROLL REVEAL (Intersection Observer)
    // ----------------------------------------------------
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // ----------------------------------------------------
    // LIGHTBOX LOGIC
    // ----------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    document.querySelectorAll('.gallery-item img, .timeline-img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) closeLightbox();
    });

    // ----------------------------------------------------
    // SECRET LETTER (Typewriter Reveal)
    // ----------------------------------------------------
    const letterBtn = document.getElementById('letter-btn');
    const letterContent = document.getElementById('letter-content');
    
    letterBtn.addEventListener('click', () => {
        letterBtn.style.display = 'none';
        letterContent.style.display = 'block';
        
        const text = CONFIG.letter.content;
        letterContent.innerText = '';
        let i = 0;
        
        // Typewriter effect
        const speed = 40; // ms per char
        function typeWriter() {
            if (i < text.length) {
                letterContent.innerHTML += text.charAt(i) === '\\n' ? '<br>' : text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            }
        }
        typeWriter();
    });

    // ----------------------------------------------------
    // ENVELOPE SURPRISE
    // ----------------------------------------------------
    const envelope = document.getElementById('envelope');
    envelope.addEventListener('click', () => {
        envelope.classList.toggle('open');
        envelope.classList.toggle('envelope-flap-open');
    });
    
    // ----------------------------------------------------
    // PROPOSAL BUTTONS (YES / NO)
    // ----------------------------------------------------
    const btnNo = document.getElementById('btn-no');
    const btnYes = document.getElementById('btn-yes');

    // Runaway NO button
    btnNo.addEventListener('mouseover', (e) => {
        const x = Math.random() * (window.innerWidth - btnNo.offsetWidth - 100);
        const y = Math.random() * (window.innerHeight - btnNo.offsetHeight - 100);
        
        btnNo.style.position = 'fixed';
        btnNo.style.left = `${x}px`;
        btnNo.style.top = `${y}px`;
    });
    
    // Fallback for mobile tap on NO
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        const x = Math.random() * (window.innerWidth - btnNo.offsetWidth - 50);
        const y = Math.random() * (window.innerHeight - btnNo.offsetHeight - 50);
        
        btnNo.style.position = 'fixed';
        btnNo.style.left = `${x}px`;
        btnNo.style.top = `${y}px`;
    });

    // Remove accidental literal \n markers from the proposal section (not real line breaks).
    const proposalSection = document.querySelector('.proposal-section');
    if (proposalSection) {
        const walker = document.createTreeWalker(proposalSection, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeValue.includes('\\n')) node.nodeValue = node.nodeValue.replace(/\\n/g, '');
        }
    }

    // YES button magic
    btnYes.addEventListener('click', () => {
        const animatedScene = document.getElementById('proposal-animation');
        if (animatedScene) animatedScene.hidden = false;
        // Change text
        document.querySelector('.proposal-title').innerText = "I knew it! ❤️";
        document.querySelector('.proposal-question').innerText = "I love you!";
        
        // Hide buttons
        btnNo.style.display = 'none';
        btnYes.style.display = 'none';
        
        // Simple confetti effect
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = -10 + 'px';
            confetti.style.width = '10px';
            confetti.style.height = '15px';
            confetti.style.backgroundColor = ['#BA8F8F', '#4A3B32', '#FAF8F5'][Math.floor(Math.random() * 3)];
            confetti.style.zIndex = '9999';
            confetti.style.transition = 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 3s ease-in';
            
            document.body.appendChild(confetti);
            
            // Trigger animation
            setTimeout(() => {
                confetti.style.top = '100vh';
                confetti.style.transform = `rotate(${Math.random() * 360}deg) translateX(${Math.random() * 100 - 50}px)`;
            }, 10);
            
            // Clean up
            setTimeout(() => confetti.remove(), 3000);
        }
    });

});

