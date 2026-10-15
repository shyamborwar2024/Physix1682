/* Lightweight Three.js atom scene and interactive 2D physics models. */
const Physics3D = (function() {
    let renderer;
    let scene;
    let camera;
    let atom;
    let particles;
    let frameId;
    let pointerX = 0;
    let pointerY = 0;
    let targetX = 0;
    let targetY = 0;

    function initHero() {
        const canvas = document.querySelector('.hero-canvas');
        const hero = canvas?.parentElement;
        if (renderer || !canvas || !hero || !window.THREE || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        try {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(55, hero.clientWidth / hero.clientHeight, .1, 100);
            camera.position.z = 13;
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: innerWidth > 700, powerPreference: 'low-power' });
            renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
            renderer.setSize(hero.clientWidth, hero.clientHeight);
            createAtom();
            const count = innerWidth < 700 ? 140 : 320;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = (Math.random() - .5) * 25;
                positions[i + 1] = (Math.random() - .5) * 15;
                positions[i + 2] = (Math.random() - .5) * 16;
            }
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x7cbdf8, size: .035, transparent: true, opacity: .65 }));
            scene.add(particles, new THREE.AmbientLight(0xffffff, .85));
            const light = new THREE.PointLight(0x20c7ee, 2.5, 30);
            light.position.set(2, 2, 6);
            scene.add(light);
            document.addEventListener('pointermove', onPointerMove, { passive: true });
            window.addEventListener('resize', resizeHero, { passive: true });
            document.addEventListener('visibilitychange', onVisibilityChange);
            animate();
        } catch (error) {
            console.warn('WebGL is unavailable; showing the CSS physics illustration instead.', error);
        }
    }

    function createAtom() {
        atom = new THREE.Group();
        const electrons = [];
        const nucleus = new THREE.Mesh(
            new THREE.SphereGeometry(.42, 20, 16),
            new THREE.MeshBasicMaterial({ color: 0x80e6f3 })
        );
        atom.add(nucleus);
        for (let i = 0; i < 3; i++) {
            const orbit = new THREE.Mesh(
                new THREE.TorusGeometry(2.3, .012, 5, 96),
                new THREE.MeshBasicMaterial({ color: i === 1 ? 0x9d8aff : 0x57c8ed, transparent: true, opacity: .5 })
            );
            orbit.rotation.set(i * .9, i * .62, i * .5);
            atom.add(orbit);
            const electron = new THREE.Mesh(
                new THREE.SphereGeometry(.09, 10, 8),
                new THREE.MeshBasicMaterial({ color: i === 1 ? 0xc9b6ff : 0xa1f0ff })
            );
            electron.userData = { orbit: i, angle: i * 2.1 };
            electrons.push(electron);
            atom.add(electron);
        }
        atom.userData.electrons = electrons;
        scene.add(atom);
    }

    function onPointerMove(event) {
        targetX = (event.clientX / innerWidth - .5) * 1.2;
        targetY = (event.clientY / innerHeight - .5) * -.8;
    }

    function resizeHero() {
        const hero = renderer?.domElement.parentElement;
        if (!hero || !camera || !renderer) return;
        camera.aspect = hero.clientWidth / hero.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(hero.clientWidth, hero.clientHeight);
    }

    function animate() {
        frameId = requestAnimationFrame(animate);
        pointerX += (targetX - pointerX) * .025;
        pointerY += (targetY - pointerY) * .025;
        camera.position.x = pointerX;
        camera.position.y = pointerY;
        camera.lookAt(0, 0, 0);
        atom.rotation.y += .003;
        atom.rotation.x += .001;
        atom.userData.electrons.forEach(electron => {
            electron.userData.angle += .012;
            const angle = electron.userData.angle;
            const orbit = electron.userData.orbit;
            electron.position.set(
                Math.cos(angle) * 2.3,
                Math.sin(angle) * 1.4,
                Math.sin(angle + orbit) * 1.1
            );
        });
        particles.rotation.y += .0002;
        renderer.render(scene, camera);
    }

    function onVisibilityChange() {
        if (document.hidden) cancelAnimationFrame(frameId);
        else if (renderer && !frameId) animate();
        if (!document.hidden && renderer) {
            cancelAnimationFrame(frameId);
            animate();
        }
    }

    const SIMS = {
        projectile: {
            title: 'Projectile motion', labels: ['Initial speed (m/s)', 'Launch angle (°)', 'Gravity (m/s²)'],
            ranges: [[10, 90, 1], [15, 75, 1], [2, 20, .1]],
            defaults: [50, 45, 9.8], formula: 'R = v² sin(2θ) / g',
            explain: 'For an ideal projectile, the horizontal range depends on launch speed, angle and gravitational acceleration.',
            value: v => `Range ≈ ${(v[0] ** 2 * Math.sin(2 * v[1] * Math.PI / 180) / v[2]).toFixed(1)} m`
        },
        pendulum: {
            title: 'Simple pendulum', labels: ['Length (cm)', 'Initial angle (°)', 'Gravity (m/s²)'],
            ranges: [[10, 90, 1], [5, 60, 1], [2, 20, .1]],
            defaults: [50, 30, 9.8], formula: 'T = 2π√(L / g)',
            explain: 'For small oscillations, a pendulum’s period depends on its length and local gravitational acceleration.',
            value: v => `Period ≈ ${(2 * Math.PI * Math.sqrt(v[0] / 100 / v[2])).toFixed(2)} s`
        },
        wave: {
            title: 'Wave propagation', labels: ['Amplitude (cm)', 'Frequency (Hz)', 'Wavelength (m)'],
            ranges: [[10, 90, 1], [1, 15, .1], [1, 20, .1]],
            defaults: [50, 4, 5], formula: 'v = fλ',
            explain: 'Wave speed is the product of frequency and wavelength; amplitude changes the displacement, not the speed.',
            value: v => `Wave speed = ${(v[1] * v[2]).toFixed(1)} m/s`
        },
        lens: {
            title: 'Convex lens', labels: ['Object distance (cm)', 'Focal length (cm)', 'Object height (cm)'],
            ranges: [[10, 90, 1], [5, 45, 1], [1, 20, .1]],
            defaults: [60, 20, 5], formula: '1/f = 1/v − 1/u',
            explain: 'A thin converging lens forms an image according to the lens equation. The diagram is schematic.',
            value: v => `Image distance ≈ ${(v[0] * v[1] / Math.max(1, v[0] - v[1])).toFixed(1)} cm`
        },
        electric: {
            title: 'Electric field', labels: ['Charge (nC)', 'Separation (cm)', 'Probe distance (cm)'],
            ranges: [[1, 100, 1], [1, 100, 1], [1, 100, 1]],
            defaults: [50, 45, 20], formula: 'E = kq / r²',
            explain: 'The field around an ideal point charge decreases with the square of distance.',
            value: v => `Relative field = ${(v[0] / (v[2] / 10) ** 2).toFixed(2)}`
        },
        magnetic: {
            title: 'Magnetic field', labels: ['Current (A)', 'Radius (cm)', 'Turns'],
            ranges: [[1, 100, 1], [1, 100, 1], [1, 100, 1]],
            defaults: [50, 45, 20], formula: 'B ∝ NI / r',
            explain: 'The field near a current loop grows with current and turns, and falls as the loop radius increases.',
            value: v => `Relative field = ${(v[0] * v[2] / Math.max(v[1], 1)).toFixed(2)}`
        },
        quantum: {
            title: 'Atomic energy levels', labels: ['Level n', 'Transition level', 'Photon scale'],
            ranges: [[1, 10, 1], [1, 10, 1], [1, 10, 1]],
            defaults: [5, 2, 6], formula: 'Eₙ ∝ −1 / n²',
            explain: 'Bound electron energies are discrete. Moving between levels absorbs or emits a photon.',
            value: v => `Level gap ∝ ${Math.abs(1 / (v[0] / 20) ** 2 - 1 / (v[1] / 20) ** 2).toFixed(3)}`
        }
    };

    function initLab() {
        const canvas = document.getElementById('lab-simulation');
        const selector = document.getElementById('lab-sim-select');
        if (!canvas || !selector) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const controls = [1, 2, 3].map(index => document.getElementById(`lab-param-${['one', 'two', 'three'][index - 1]}`));
        const startedAt = performance.now();
        let simulation = SIMS[selector.value];
        let animationId = 0;
        let width = 0;
        let height = 0;
        let values = [];
        const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            const ratio = Math.min(devicePixelRatio || 1, 1.5);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            draw(performance.now());
        }

        function readControls() {
            values = controls.map(control => Number(control.value));
            values.forEach((value, index) => {
                document.getElementById(`val${index + 1}`).textContent = String(value);
                const label = document.getElementById(`lab-label-${['one', 'two', 'three'][index]}`);
                label.textContent = simulation.labels[index];
            });
            document.getElementById('lab-sim-title').textContent = simulation.title;
            document.getElementById('lab-formula').textContent = simulation.formula;
            document.getElementById('lab-explanation').textContent = simulation.explain;
            document.getElementById('lab-live-value').textContent = simulation.value(values);
            draw(performance.now());
        }

        function draw(time) {
            if (!width || !height) return;
            const t = reducedMotion ? 0 : (time - startedAt) / 1000;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#09162b';
            ctx.fillRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(120, 176, 225, .08)';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
            for (let y = 0; y < height; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); }
            if (simulation === SIMS.projectile) drawProjectile(t);
            else if (simulation === SIMS.pendulum) drawPendulum(t);
            else if (simulation === SIMS.wave) drawWave(t);
            else if (simulation === SIMS.lens) drawLens();
            else if (simulation === SIMS.electric || simulation === SIMS.magnetic) drawField(t, simulation === SIMS.magnetic);
            else drawLevels(t);
        }

        function drawProjectile(t) {
            const floor = height * .78;
            const startX = width * .12;
            const endX = width * .84;
            ctx.strokeStyle = 'rgba(185, 208, 231, .45)';
            ctx.beginPath(); ctx.moveTo(startX, floor); ctx.lineTo(width * .92, floor); ctx.stroke();
            const angle = (values[1] || 45) * Math.PI / 180;
            ctx.beginPath();
            ctx.strokeStyle = '#4bd6e8';
            ctx.lineWidth = 3;
            for (let i = 0; i <= 70; i++) {
                const p = i / 70;
                const x = startX + p * (endX - startX);
                const arcHeight = Math.sin(Math.PI * p) * (height * .18 + values[0] * .8) * Math.sin(angle) * 1.25;
                const y = floor - arcHeight;
                i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
            const phase = (t * .22) % 1;
            const x = startX + phase * (endX - startX);
            const y = floor - Math.sin(Math.PI * phase) * (height * .18 + values[0] * .8) * Math.sin(angle) * 1.25;
            drawDot(x, y, '#c3fbff');
        }

        function drawPendulum(t) {
            const length = Math.min(height * .62, 65 + values[0] * 1.45);
            const angle = Math.sin(t * Math.sqrt((values[2] || 10) / (values[0] || 50))) * values[1] * Math.PI / 220;
            const pivotX = width / 2;
            const pivotY = height * .18;
            const bobX = pivotX + Math.sin(angle) * length;
            const bobY = pivotY + Math.cos(angle) * length;
            ctx.strokeStyle = 'rgba(185, 208, 231, .7)';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke();
            drawDot(pivotX, pivotY, '#8ba8c8', 5);
            drawDot(bobX, bobY, '#66deec', 15);
        }

        function drawWave(t) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#55d9e8';
            ctx.beginPath();
            for (let x = 0; x < width; x += 2) {
                const y = height / 2 + Math.sin((x / width * values[2] * Math.PI * 2) - t * values[1]) * values[0] * .68;
                x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
            }
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255,255,255,.12)';
            ctx.beginPath(); ctx.moveTo(20, height / 2); ctx.lineTo(width - 20, height / 2); ctx.stroke();
        }

        function drawLens() {
            const mid = width / 2;
            ctx.strokeStyle = 'rgba(175, 193, 215, .45)';
            ctx.beginPath(); ctx.moveTo(24, height / 2); ctx.lineTo(width - 24, height / 2); ctx.stroke();
            ctx.strokeStyle = '#65d8ed';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(mid, height * .16); ctx.quadraticCurveTo(mid - 28, height / 2, mid, height * .84); ctx.quadraticCurveTo(mid + 28, height / 2, mid, height * .16); ctx.stroke();
            ctx.strokeStyle = '#c3a5ff';
            ctx.lineWidth = 2;
            const objectX = mid - Math.min(width * .3, values[0] * 2);
            const imageX = mid + Math.min(width * .36, (values[1] * values[0] / Math.max(1, values[0] - values[1])) * 1.25);
            drawArrow(objectX, height / 2, height * .22, '#a7dafe');
            drawArrow(Math.min(width - 34, imageX), height / 2, -height * .28, '#c3a5ff');
            ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(objectX, height * .22); ctx.lineTo(mid, height / 2); ctx.lineTo(imageX, height * .22); ctx.stroke(); ctx.setLineDash([]);
        }

        function drawField(t, magnetic) {
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) * .24;
            for (let ring = 1; ring <= 5; ring++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(${magnetic ? '172, 143, 255' : '71, 217, 232'}, ${.35 - ring * .035})`;
                ctx.lineWidth = 1.5;
                ctx.ellipse(centerX, centerY, radius * ring * .32, radius * ring * .23, t * .04, 0, Math.PI * 2);
                ctx.stroke();
            }
            drawDot(centerX, centerY, magnetic ? '#b298ff' : '#6be3ed', 17);
            for (let i = 0; i < 8; i++) {
                const a = t * .4 + i * Math.PI / 4;
                drawDot(centerX + Math.cos(a) * radius, centerY + Math.sin(a) * radius * .72, '#d6efff', 3);
            }
            ctx.fillStyle = '#d6e6f5';
            ctx.font = '600 13px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(magnetic ? 'I' : 'q', centerX, centerY + 4);
        }

        function drawLevels(t) {
            const left = width * .2;
            const right = width * .78;
            const levels = [height * .76, height * .61, height * .49, height * .39, height * .31];
            levels.forEach((y, index) => {
                ctx.strokeStyle = index === 4 ? 'rgba(190,154,255,.85)' : 'rgba(111,203,232,.55)';
                ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
                ctx.fillStyle = '#a9bed8'; ctx.textAlign = 'left'; ctx.font = '12px sans-serif';
                ctx.fillText(`n = ${index + 1}`, left - 38, y + 4);
            });
            const pulse = (Math.sin(t * 2) + 1) / 2;
            const x = left + 28 + pulse * (right - left - 56);
            drawDot(x, levels[4], '#d2b5ff', 7);
            ctx.strokeStyle = 'rgba(220,190,255,.6)'; ctx.setLineDash([5, 4]);
            ctx.beginPath(); ctx.moveTo(x, levels[4]); ctx.lineTo(x, levels[1]); ctx.stroke(); ctx.setLineDash([]);
        }

        function drawArrow(x, y, length, color) {
            ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - length); ctx.stroke();
            const direction = Math.sign(length);
            ctx.beginPath(); ctx.moveTo(x, y - length); ctx.lineTo(x - 5, y - length + 9 * direction); ctx.lineTo(x + 5, y - length + 9 * direction); ctx.closePath(); ctx.fill();
        }

        function drawDot(x, y, color, radius = 7) {
            ctx.beginPath(); ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 18;
            ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }

        function setSimulation() {
            simulation = SIMS[selector.value] || SIMS.projectile;
            controls.forEach((control, index) => {
                const [min, max, step] = simulation.ranges[index];
                control.min = String(min);
                control.max = String(max);
                control.step = String(step);
                control.value = String(simulation.defaults[index]);
            });
            readControls();
        }

        selector.addEventListener('change', setSimulation);
        controls.forEach(control => control.addEventListener('input', readControls));
        document.getElementById('lab-reset').addEventListener('click', setSimulation);
        document.querySelectorAll('[data-sim-link]').forEach(link => link.addEventListener('click', () => {
            selector.value = link.dataset.simLink;
            setSimulation();
        }));
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(animationId);
            else if (!reducedMotion) animate();
        });
        function animate(time) {
            draw(time);
            if (!reducedMotion && !document.hidden) animationId = requestAnimationFrame(animate);
        }
        setSimulation();
        resize();
        if (!reducedMotion) animationId = requestAnimationFrame(animate);
    }

    function init() {
        initHero();
        initLab();
    }

    window.addEventListener('physx:three-ready', initHero, { once: true });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
    return { init };
})();
