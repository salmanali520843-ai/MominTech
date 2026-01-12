window.addEventListener("load", () => {
    const canvas = document.getElementById("particleCanvas");
    const ctx = canvas.getContext("2d");
    const ambientBox = document.querySelector(".ambient-box");

    // Variables that need to be accessible globally within this scope
    let particles = [];
    let textData = null; 
    
    // Mouse settings
    const mouse = { x: -9999, y: -9999, smoothedX: -9999, smoothedY: -9999, radius: 120, smoothing: 0.15 };
    
    // Canvas Bounds for collision
    const boxBounds = {
        left: 0, right: 0, top: 0, bottom: 0,
        update() {
            this.left = 0;
            this.right = canvas.width;
            this.top = 0;
            this.bottom = canvas.height;
        }
    };

    // =================================================================
    // 1. CORE RESIZE & TEXT LOGIC
    //    This function runs whenever the box changes size.
    // =================================================================
    function refreshCanvasState() {
        if (!ambientBox) return;

        // A. Match Canvas Size to Box Size exactly
        canvas.width = ambientBox.offsetWidth;
        canvas.height = ambientBox.offsetHeight;

        // B. Update Collision Bounds
        boxBounds.update();

        // C. Redraw Text to center it in the NEW size
        ctx.fillStyle = "white";
        // Responsive font size: 100px or smaller if width is tight
        const fontSize = Math.min(100, canvas.width * 0.15); 
        ctx.font = `bold ${fontSize}px Roboto, Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textX = canvas.width / 2;
        const textY = canvas.height / 2;

        ctx.fillText("MOMINTECH", textX, textY);
        
        // D. Capture the new pixel data
        textData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // E. Clear the text so we only see particles
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // F. Re-initialize particles based on new text position
        initParticles();
    }

    // =================================================================
    // 2. PARTICLE CLASS
    // =================================================================
    class Particle {
        constructor(x, y) {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseX = x;
            this.baseY = y;
            this.vx = 0;
            this.vy = 0;
            this.size = 0.7;
            this.density = Math.random() * 10 + 3;
            this.damping = 0.95;
            this.bounce = 0.8;
        }

        draw() {
            ctx.fillStyle = "#1c75bc";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        update() {
            // Mouse interaction
            let dx = mouse.smoothedX - this.x;
            let dy = mouse.smoothedY - this.y;
            let distSq = dx * dx + dy * dy;

            if (distSq < mouse.radius * mouse.radius) {
                let dist = Math.sqrt(distSq) || 1;
                let force = (mouse.radius - dist) / mouse.radius;
                this.vx -= (dx / dist) * force * this.density;
                this.vy -= (dy / dist) * force * this.density;
            }

            // Spring force back to base
            let springX = (this.baseX - this.x) * 0.01;
            let springY = (this.baseY - this.y) * 0.01;

            this.vx += springX;
            this.vy += springY;

            // Damping
            this.vx *= this.damping;
            this.vy *= this.damping;

            // Update pos
            this.x += this.vx;
            this.y += this.vy;

            // Bounds collision
            const radius = this.size;
            if (this.x - radius < boxBounds.left) { this.x = boxBounds.left + radius; this.vx *= -this.bounce; }
            if (this.x + radius > boxBounds.right) { this.x = boxBounds.right - radius; this.vx *= -this.bounce; }
            if (this.y - radius < boxBounds.top) { this.y = boxBounds.top + radius; this.vy *= -this.bounce; }
            if (this.y + radius > boxBounds.bottom) { this.y = boxBounds.bottom - radius; this.vy *= -this.bounce; }
        }
    }

    function initParticles() {
        particles = [];
        // Only run if we have text data
        if (!textData) return;

        // Scan the canvas for pixels to place particles
        // Step = 2 for performance (checks every 2nd pixel)
        for (let y = 0; y < canvas.height; y += 2) {
            for (let x = 0; x < canvas.width; x += 2) {
                const index = (y * canvas.width + x) * 4;
                // If alpha > 150, it's part of the text
                if (textData.data[index + 3] > 150) {
                    particles.push(new Particle(x, y));
                }
            }
        }
    }

    // =================================================================
    // 3. OBSERVERS & LISTENERS
    // =================================================================
    
    // ResizeObserver: Detects when .ambient-box changes size (Mobile/Desktop)
    const resizeObserver = new ResizeObserver(() => {
        refreshCanvasState();
    });
    
    if (ambientBox) {
        resizeObserver.observe(ambientBox);
    } else {
        // Fallback if box is missing
        window.addEventListener("resize", refreshCanvasState);
        refreshCanvasState();
    }

    // Mouse Listeners
    window.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = -9999;
        mouse.y = -9999;
    });

    canvas.addEventListener("click", () => {
        mouse.radius = 300;
        setTimeout(() => mouse.radius = 120, 200);
    });

    // =================================================================
    // 4. ANIMATION LOOP
    // =================================================================
    function animate() {
        // Smooth mouse coords
        mouse.smoothedX += (mouse.x - mouse.smoothedX) * mouse.smoothing;
        mouse.smoothedY += (mouse.y - mouse.smoothedY) * mouse.smoothing;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    animate();

    // =================================================================
    // 5. VIDEO LOGO LOGIC (Unchanged)
    // =================================================================
    const logoVideo = document.getElementById("logoVideo");
    const logoImage = document.getElementById("logoImage");

    if (logoVideo && logoImage) {
        let playCount = 0;
        logoVideo.addEventListener("ended", () => {
            playCount++;
            if (playCount < 0) {
                logoVideo.currentTime = 0;
                logoVideo.play();
            } else {
                logoVideo.classList.add("fade-out");
                setTimeout(() => {
                    logoVideo.pause();
                    logoVideo.style.display = "none";
                    logoImage.style.display = "block";
                    logoImage.style.opacity = "0";
                    logoImage.classList.add("fade-in");
                    requestAnimationFrame(() => {
                        logoImage.style.opacity = "1";
                    });
                }, 600);
            }
        });
    }
});

// =================================================================
// 6. GLOW ANIMATION (Unchanged)
// =================================================================
const glow = document.querySelector(".ambient-glow");
if(glow) {
    let t1 = 0;
    let t2 = Math.PI;

    function animateGlow() {
        t1 += 0.01;
        t2 += 0.008;
        const leftMove = Math.sin(t1) * 30;
        const rightMove = Math.sin(t2) * 30;
        glow.style.setProperty("--left-shift", `${leftMove}px`);
        glow.style.setProperty("--right-shift", `${rightMove}px`);
        glow.style.setProperty("transform", `translateY(${(leftMove + rightMove) / 6}px)`);
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}
