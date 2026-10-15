/* Animated, lightweight deep-space backgrounds for page hero sections. */
(function() {
    const heroes = [...document.querySelectorAll('.hero')];
    if (!heroes.length) return;

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const activeHeroes = new Set();
    let pointerX = 0;
    let pointerY = 0;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function createScene(hero) {
        hero.classList.add('galaxy-hero');
        const canvas = document.createElement('canvas');
        canvas.className = 'galaxy-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        hero.prepend(canvas);

        const context = canvas.getContext('2d', { alpha: true });
        if (!context) return;

        let width = 0;
        let height = 0;
        let pixelRatio = 1;
        let animationFrame = 0;
        let lastCometTime = 0;
        let comet = null;
        const stars = [];
        const planet = {
            x: randomBetween(.12, .88),
            y: randomBetween(.17, .83),
            radius: randomBetween(22, 46),
            hue: randomBetween(185, 285),
            depth: randomBetween(.4, 1)
        };

        function resize() {
            const bounds = hero.getBoundingClientRect();
            width = Math.max(1, bounds.width);
            height = Math.max(1, bounds.height);
            pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(width * pixelRatio);
            canvas.height = Math.round(height * pixelRatio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            const count = Math.round(Math.min(190, Math.max(75, width * height / 8500)));
            stars.length = 0;
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random(),
                    y: Math.random(),
                    depth: randomBetween(.15, 1),
                    radius: randomBetween(.35, 1.25),
                    phase: randomBetween(0, Math.PI * 2),
                    hue: [190, 205, 225, 265, 300][Math.floor(Math.random() * 5)]
                });
            }
            draw(0, true);
        }

        function draw(now, staticFrame = false) {
            context.clearRect(0, 0, width, height);
            const elapsed = staticFrame ? 0 : now / 1000;
            const parallaxX = pointerX * 16;
            const parallaxY = pointerY * 12;

            const nebula = context.createRadialGradient(
                width * (.72 + pointerX * .035), height * (.42 + pointerY * .035), 0,
                width * .72, height * .42, Math.max(width, height) * .68
            );
            nebula.addColorStop(0, 'rgba(57, 76, 183, 0.13)');
            nebula.addColorStop(.48, 'rgba(22, 129, 168, 0.055)');
            nebula.addColorStop(1, 'rgba(4, 10, 27, 0)');
            context.fillStyle = nebula;
            context.fillRect(0, 0, width, height);

            stars.forEach(star => {
                const drift = staticFrame ? 0 : elapsed * star.depth * 1.4;
                const x = (star.x * width + parallaxX * star.depth + drift) % width;
                const y = (star.y * height + parallaxY * star.depth + Math.sin(elapsed * .18 + star.phase) * 2) % height;
                const pulse = staticFrame ? .72 : .48 + (Math.sin(elapsed * 1.8 + star.phase) + 1) * .25;
                context.beginPath();
                context.fillStyle = `hsla(${star.hue}, 95%, 82%, ${pulse * star.depth})`;
                context.shadowColor = `hsla(${star.hue}, 100%, 70%, .8)`;
                context.shadowBlur = star.radius * 5;
                context.arc(x, y, star.radius * (star.depth * .7 + .45), 0, Math.PI * 2);
                context.fill();
            });
            context.shadowBlur = 0;

            const px = planet.x * width - parallaxX * planet.depth;
            const py = planet.y * height - parallaxY * planet.depth;
            const radius = planet.radius * Math.min(1, width / 900);
            const atmosphere = context.createRadialGradient(px, py, radius * .25, px, py, radius * 1.65);
            atmosphere.addColorStop(0, `hsla(${planet.hue}, 95%, 66%, .28)`);
            atmosphere.addColorStop(.56, `hsla(${planet.hue}, 85%, 48%, .13)`);
            atmosphere.addColorStop(1, `hsla(${planet.hue}, 90%, 44%, 0)`);
            context.fillStyle = atmosphere;
            context.beginPath();
            context.arc(px, py, radius * 1.65, 0, Math.PI * 2);
            context.fill();

            const surface = context.createRadialGradient(
                px - radius * .42, py - radius * .45, radius * .04,
                px, py, radius
            );
            surface.addColorStop(0, `hsla(${planet.hue + 26}, 90%, 76%, .82)`);
            surface.addColorStop(.35, `hsla(${planet.hue}, 85%, 51%, .64)`);
            surface.addColorStop(1, `hsla(${planet.hue - 18}, 90%, 25%, .76)`);
            context.save();
            context.translate(px, py);
            context.rotate(-.28);
            context.scale(1, .32);
            context.beginPath();
            context.ellipse(0, 0, radius * 1.65, radius * 1.65, 0, 0, Math.PI * 2);
            context.strokeStyle = `hsla(${planet.hue + 36}, 96%, 82%, .55)`;
            context.lineWidth = Math.max(1, radius * .035);
            context.stroke();
            context.restore();
            context.beginPath();
            context.arc(px, py, radius, 0, Math.PI * 2);
            context.fillStyle = surface;
            context.fill();
            context.save();
            context.translate(px, py);
            context.rotate(-.28);
            context.scale(1, .32);
            context.beginPath();
            context.ellipse(0, 0, radius * 1.65, radius * 1.65, 0, 0, Math.PI);
            context.strokeStyle = `hsla(${planet.hue + 36}, 96%, 87%, .72)`;
            context.lineWidth = Math.max(1.5, radius * .055);
            context.stroke();
            context.restore();

            if (!staticFrame && (!comet || now - lastCometTime > randomBetween(3200, 6800))) {
                comet = {
                    x: randomBetween(width * .35, width * 1.15),
                    y: randomBetween(-height * .08, height * .55),
                    length: randomBetween(70, 150),
                    speed: randomBetween(520, 900),
                    hue: randomBetween(185, 285),
                    startedAt: now
                };
                lastCometTime = now;
            }
            if (comet && !staticFrame) {
                const progress = (now - comet.startedAt) / comet.speed;
                const x = comet.x - progress * width * .8;
                const y = comet.y + progress * height * .55;
                if (progress < 1.1 && x > -comet.length && y < height + comet.length) {
                    const tail = context.createLinearGradient(x, y, x + comet.length, y - comet.length * .62);
                    tail.addColorStop(0, `hsla(${comet.hue}, 100%, 80%, .95)`);
                    tail.addColorStop(.18, `hsla(${comet.hue + 30}, 100%, 72%, .32)`);
                    tail.addColorStop(1, `hsla(${comet.hue + 55}, 100%, 70%, 0)`);
                    context.beginPath();
                    context.moveTo(x, y);
                    context.lineTo(x + comet.length, y - comet.length * .62);
                    context.strokeStyle = tail;
                    context.lineWidth = 2;
                    context.shadowColor = `hsla(${comet.hue}, 100%, 76%, .9)`;
                    context.shadowBlur = 14;
                    context.stroke();
                    context.shadowBlur = 0;
                } else {
                    comet = null;
                }
            }
            if (!staticFrame && activeHeroes.has(hero) && !document.hidden) {
                animationFrame = requestAnimationFrame(draw);
            }
        }

        function start() {
            if (reducedMotion || animationFrame || document.hidden) return;
            activeHeroes.add(hero);
            animationFrame = requestAnimationFrame(time => {
                animationFrame = 0;
                draw(time);
            });
        }

        function stop() {
            activeHeroes.delete(hero);
            cancelAnimationFrame(animationFrame);
            animationFrame = 0;
            draw(0, true);
        }

        hero.addEventListener('pointermove', event => {
            const bounds = hero.getBoundingClientRect();
            pointerX = (event.clientX - bounds.left) / bounds.width - .5;
            pointerY = (event.clientY - bounds.top) / bounds.height - .5;
        }, { passive: true });
        hero.addEventListener('pointerleave', () => {
            pointerX = 0;
            pointerY = 0;
        }, { passive: true });
        window.addEventListener('resize', resize, { passive: true });
        resize();
        return { start, stop };
    }

    const scenes = heroes.map(hero => [hero, createScene(hero)]).filter(([, scene]) => scene);
    if (reducedMotion) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const scene = scenes.find(([hero]) => hero === entry.target)?.[1];
            if (!scene) return;
            if (entry.isIntersecting) scene.start();
            else scene.stop();
        });
    }, { rootMargin: '100px' });
    scenes.forEach(([hero]) => observer.observe(hero));
    document.addEventListener('visibilitychange', () => {
        scenes.forEach(([, scene]) => {
            if (document.hidden) scene.stop();
        });
    });
})();
