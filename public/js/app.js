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
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const container = document.getElementById('scratch-card-container');
        const instruction = document.getElementById('scratch-instruction');
        const progressFill = document.getElementById('scratch-progress-fill');
        const progressText = document.getElementById('scratch-progress-text');
        const progressContainer = document.getElementById('scratch-progress-container');
        const continueBtn = document.getElementById('landing-continue-btn');
        const skipBtn = document.getElementById('reveal-skip-btn');
        
        let isDrawing = false;
        let isRevealed = false;
        let hasStarted = false;

        function initCanvas() {
            const ratio = window.devicePixelRatio || 1;
            canvas.width = container.offsetWidth * ratio;
            canvas.height = container.offsetHeight * ratio;
            
            ctx.scale(ratio, ratio);
            
            // Draw scratch overlay
            ctx.fillStyle = '#EBE6DF';
            ctx.fillRect(0, 0, container.offsetWidth, container.offsetHeight);
            
            // Add subtle noise to canvas
            for(let i=0; i<1000; i++) {
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)';
                ctx.fillRect(Math.random() * container.offsetWidth, Math.random() * container.offsetHeight, 2, 2);
            }
        }
        
        // Initialize immediately
        initCanvas();
        
        // Handle resize
        window.addEventListener('resize', initCanvas);

        function getMousePos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function scratch(e) {
            if (!isDrawing || isRevealed) return;
            e.preventDefault();
            
            if (!hasStarted) {
                instruction.style.opacity = '0';
                hasStarted = true;
            }
            
            const pos = getMousePos(e);
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            // Use radial gradient for soft brush
            const radGrad = ctx.createRadialGradient(pos.x, pos.y, 10, pos.x, pos.y, 40);
            radGrad.addColorStop(0, 'rgba(0,0,0,1)');
            radGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radGrad;
            ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
            ctx.fill();
            
            checkCompletion();
        }

        function checkCompletion() {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const step = 40; 
            let transparent = 0, total = 0;
            
            for (let i = 0; i < data.length; i += step * 4) {
                if (data[i + 3] < 128) transparent++;
                total++;
            }
            
            const percent = Math.min(100, Math.round((transparent / total) * 100));
            
            if (!isRevealed) {
                progressFill.style.width = percent + '%';
                progressText.innerText = percent + '% revealed';
            }
            
            if (percent >= scratchConfig.revealThreshold && !isRevealed) {
                revealMemory();
            }
        }

        function revealMemory() {
            isRevealed = true;
            canvas.style.opacity = '0';
            instruction.style.opacity = '0';
            progressContainer.style.opacity = '0';
            setTimeout(() => progressContainer.style.display = 'none', 500);
            
            container.classList.add('revealed');
            continueBtn.classList.add('visible');
            
            setTimeout(() => {
                canvas.style.display = 'none';
            }, 1000);
        }

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(e); });
        canvas.addEventListener('mousemove', scratch);
        window.addEventListener('mouseup', () => isDrawing = false);
        
        canvas.addEventListener('touchstart', (e) => { 
            isDrawing = true; 
            // Prevent scrolling on mobile while scratching
            document.body.style.overflow = 'hidden'; 
            scratch(e); 
        });
        canvas.addEventListener('touchmove', scratch, { passive: false });
        window.addEventListener('touchend', () => { 
            isDrawing = false;
            document.body.style.overflow = '';
        });

        // Skip reveal button
        skipBtn.addEventListener('click', revealMemory);

        // Continue Button
        continueBtn.addEventListener('click', () => {
            landing.classList.add('hidden');
            document.body.classList.remove('no-scroll');
            
            // Auto-scroll to top smoothly so the hero section is perfectly in view
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            toggleMusic(); // start music
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

    // YES button magic
    btnYes.addEventListener('click', () => {
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
