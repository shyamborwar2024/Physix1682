/* Responsive, lightweight canvas experiments featured on the homepage. */
(function() {
    const root = document.getElementById('home-lab-showcase');
    const canvas = document.getElementById('home-lab-canvas');
    if (!root || !canvas) return;

    const ctx = canvas.getContext('2d');
    const title = document.getElementById('home-lab-title');
    const description = document.getElementById('home-lab-description');
    const reading = document.getElementById('home-lab-reading');
    const formula = document.getElementById('home-lab-formula');
    const controlsRoot = document.getElementById('home-lab-controls');
    const fallback = document.getElementById('home-lab-canvas-fallback');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeId = 'double-slit';
    let activeValues = {};
    let width = 0;
    let height = 0;
    let frameId = 0;
    let inView = false;

    const experiments = {
        'double-slit': {
            title: "Young's Double-Slit Interference",
            description: 'Two coherent slits create bright and dark fringes. Change the wavelength or slit spacing to explore the pattern.',
            formula: 'β = λL / d (L = 0.40 m)',
            controls: [
                { id: 'wavelength', label: 'Wavelength', min: 380, max: 700, step: 1, value: 672, unit: 'nm' },
                { id: 'slitDistance', label: 'Slit separation', min: 2, max: 12, step: .1, value: 8, unit: 'µm' }
            ],
            reading: values => `Fringe spacing: ${(values.wavelength * .4 / values.slitDistance).toFixed(1)} mm`,
            draw: drawDoubleSlit
        },
        fiber: {
            title: 'Total Internal Reflection in an Optical Fiber',
            description: 'Follow a light ray through a fiber core. Change the launch angle and refractive indices to see when the ray remains guided.',
            formula: 'θc = sin⁻¹(n₂/n₁) · NA = √(n₁² − n₂²)',
            controls: [
                { id: 'launchAngle', label: 'Launch angle from fiber axis', min: 0, max: 70, step: 1, value: 38, unit: '°' },
                { id: 'coreIndex', label: 'Core refractive index n₁', min: 1.45, max: 1.65, step: .01, value: 1.53 },
                { id: 'claddingIndex', label: 'Cladding refractive index n₂', min: 1.2, max: 1.44, step: .01, value: 1.33 }
            ],
            reading: fiberReading,
            draw: drawFiber
        },
        'quantum-well': {
            title: 'Particle in a 1D Potential Box',
            description: 'Choose an energy level to see its standing-wave function and probability density. The idealized well has perfectly confining walls.',
            formula: 'ψₙ(x,t) = √(2/L) sin(nπx/L) cos(ωₙt) · Eₙ = n²E₁',
            controls: [
                { id: 'level', label: 'Energy level n', min: 1, max: 4, step: 1, value: 2 }
            ],
            reading: values => `Level n = ${values.level} · Eₙ = ${values.level ** 2} E₁`,
            draw: drawQuantumWell
        },
        tunneling: {
            title: 'Quantum Tunneling · New Model',
            description: 'A wave packet meets a finite potential barrier. A portion can appear beyond the barrier even when its energy is lower.',
            formula: 'T ≈ [1 + sinh²(κa) / (4r(1 − r))]⁻¹ · κa is dimensionless',
            controls: [
                { id: 'energyRatio', label: 'Particle energy / barrier height', min: .2, max: .9, step: .01, value: .55 },
                { id: 'barrierWidth', label: 'Dimensionless barrier width', min: .4, max: 2, step: .05, value: 1.1 }
            ],
            reading: tunnelingReading,
            draw: drawTunneling
        }
    };

    if (!ctx) {
        fallback.hidden = false;
        canvas.hidden = true;
    }

    function formatControl(control, value) {
        const digits = String(control.step).includes('.') ? String(control.step).split('.')[1].length : 0;
        const formatted = Number(value).toFixed(digits);
        const cleanValue = digits ? formatted.replace(/0+$/, '').replace(/\.$/, '') : formatted;
        return control.unit ? `${cleanValue} ${control.unit}` : cleanValue;
    }

    function updateReading() {
        const experiment = experiments[activeId];
        reading.textContent = experiment.reading(activeValues);
    }

    function updateControls() {
        const experiment = experiments[activeId];
        controlsRoot.replaceChildren();
        activeValues = {};
        experiment.controls.forEach(control => {
            activeValues[control.id] = control.value;
            const group = document.createElement('div');
            group.className = 'home-lab-control';
            const label = document.createElement('label');
            label.htmlFor = `home-lab-${control.id}`;
            const name = document.createElement('span');
            name.textContent = control.label;
            const output = document.createElement('output');
            output.textContent = formatControl(control, control.value);
            label.append(name, output);

            const input = document.createElement('input');
            input.type = 'range';
            input.id = `home-lab-${control.id}`;
            input.min = String(control.min);
            input.max = String(control.max);
            input.step = String(control.step);
            input.value = String(control.value);
            input.addEventListener('input', () => {
                activeValues[control.id] = Number(input.value);
                output.textContent = formatControl(control, input.value);
                updateReading();
                render(performance.now());
            });
            group.append(label, input);
            controlsRoot.appendChild(group);
        });
        updateReading();
    }

    function selectExperiment(id) {
        if (!experiments[id]) return;
        activeId = id;
        const experiment = experiments[id];
        root.querySelectorAll('[data-home-simulation]').forEach(button => {
            const selected = button.dataset.homeSimulation === id;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
        title.textContent = experiment.title;
        description.textContent = experiment.description;
        formula.textContent = experiment.formula;
        canvas.setAttribute('aria-label', `${experiment.title} animation`);
        updateControls();
        render(performance.now());
    }

    function resize() {
        if (!ctx) return;
        const bounds = canvas.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = bounds.width;
        height = bounds.height;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        render(performance.now());
    }

    function drawBackground() {
        ctx.fillStyle = '#080f22';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(111, 163, 218, .075)';
        ctx.lineWidth = 1;
        const spacing = Math.max(28, Math.min(42, width / 18));
        for (let x = spacing; x < width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = spacing; y < height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    function drawDoubleSlit(t, values) {
        const wavelength = values.wavelength;
        const laserColor = wavelength > 610 ? '#ff7887' : wavelength > 500 ? '#75efc9' : '#76dafa';
        const barrierX = width * .35;
        const screenX = width * .86;
        const centerY = height * .51;
        const slitGap = Math.max(15, Math.min(34, height * .11));
        const upperSlit = centerY - slitGap / 2;
        const lowerSlit = centerY + slitGap / 2;
        const fringeMm = wavelength * .4 / values.slitDistance;
        const fringePixels = Math.max(8, Math.min(height * .22, fringeMm * 1.45));

        ctx.fillStyle = 'rgba(255,255,255,.06)';
        ctx.fillRect(width * .04, centerY - 1, width * .9, 2);
        ctx.fillStyle = '#ff5363';
        ctx.shadowColor = '#ff5363';
        ctx.shadowBlur = 17;
        ctx.beginPath();
        ctx.arc(width * .1, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        label('LASER', width * .07, centerY + 31, '#95a8c1', 10);

        ctx.fillStyle = '#53637b';
        ctx.fillRect(barrierX - 5, height * .12, 10, height * .76);
        ctx.clearRect(barrierX - 7, upperSlit - 4, 14, 8);
        ctx.clearRect(barrierX - 7, lowerSlit - 4, 14, 8);
        ctx.fillStyle = laserColor;
        ctx.fillRect(barrierX - 4, upperSlit - 2, 8, 4);
        ctx.fillRect(barrierX - 4, lowerSlit - 2, 8, 4);
        label('DOUBLE SLIT', barrierX, height * .1, '#afbed0', 9, 'center');

        ctx.save();
        ctx.beginPath();
        ctx.rect(barrierX + 1, height * .1, screenX - barrierX - 8, height * .8);
        ctx.clip();
        const phase = reducedMotion ? 0 : (t * 42) % 42;
        [upperSlit, lowerSlit].forEach((slitY, slitIndex) => {
            ctx.strokeStyle = slitIndex ? 'rgba(111,223,255,.3)' : 'rgba(193,158,255,.36)';
            ctx.lineWidth = 1.4;
            for (let radius = 18 + phase; radius < screenX - barrierX + height; radius += 42) {
                ctx.beginPath();
                ctx.arc(barrierX, slitY, radius, -Math.PI / 2, Math.PI / 2);
                ctx.stroke();
            }
        });
        ctx.restore();

        ctx.fillStyle = 'rgba(137,155,184,.8)';
        ctx.fillRect(screenX - 3, height * .16, 6, height * .68);
        ctx.save();
        ctx.shadowColor = laserColor;
        ctx.shadowBlur = 13;
        for (let y = height * .18; y < height * .82; y += 2) {
            const intensity = Math.cos((y - centerY) / fringePixels * Math.PI) ** 2;
            ctx.globalAlpha = .12 + intensity * .88;
            ctx.fillStyle = laserColor;
            ctx.fillRect(screenX - 8, y, 16, 2);
        }
        ctx.restore();
        label('FRINGE SCREEN', screenX, height * .12, '#afbed0', 9, 'center');
        label(`λ ${wavelength} nm`, width * .1, height * .86, '#9ac9e6', 11);
        label(`β ≈ ${fringeMm.toFixed(1)} mm`, screenX - 5, height * .9, '#a8f3ff', 11, 'right');
    }

    function fiberReading(values) {
        const n1 = values.coreIndex;
        const n2 = Math.min(values.claddingIndex, n1 - .01);
        const ratio = Math.min(.999, n2 / n1);
        const critical = Math.asin(ratio) * 180 / Math.PI;
        const numericalAperture = Math.sqrt(Math.max(0, n1 * n1 - n2 * n2));
        const acceptance = Math.asin(Math.min(1, numericalAperture)) * 180 / Math.PI;
        const guided = values.launchAngle <= acceptance;
        return `θc = ${critical.toFixed(1)}° · Acceptance = ${acceptance.toFixed(1)}° · ${guided ? 'Guided by TIR' : 'Outside acceptance cone'}`;
    }

    function drawFiber(t, values) {
        const left = width * .08;
        const right = width * .92;
        const top = height * .27;
        const bottom = height * .73;
        const center = (top + bottom) / 2;
        const n1 = values.coreIndex;
        const n2 = Math.min(values.claddingIndex, n1 - .01);
        const acceptance = Math.asin(Math.min(1, Math.sqrt(n1 * n1 - n2 * n2))) * 180 / Math.PI;
        const guided = values.launchAngle <= acceptance;
        const slope = Math.tan(values.launchAngle * Math.PI / 180);

        ctx.fillStyle = 'rgba(96,128,166,.18)';
        ctx.fillRect(left, top - height * .14, right - left, bottom - top + height * .28);
        ctx.fillStyle = 'rgba(27,181,205,.1)';
        ctx.fillRect(left, top, right - left, bottom - top);
        ctx.strokeStyle = 'rgba(106,223,236,.68)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, top); ctx.lineTo(right, top);
        ctx.moveTo(left, bottom); ctx.lineTo(right, bottom);
        ctx.stroke();
        label(`CLADDING  n₂ = ${n2.toFixed(2)}`, left + 6, top - 10, '#a7b9ce', 10);
        label(`CORE  n₁ = ${n1.toFixed(2)}`, left + 6, bottom + 18, '#a7b9ce', 10);
        label(guided ? 'TIR · RAY GUIDED' : 'RAY LEAVES CORE', width * .77, top - 10, guided ? '#62ebbd' : '#ffae7b', 10, 'center');

        const points = [{ x: left + 8, y: center }];
        let x = left + 8;
        let y = center;
        let direction = 1;
        let escaped = false;
        if (slope > .002) {
            for (let bounce = 0; bounce < 20 && x < right; bounce++) {
                const wall = direction > 0 ? bottom : top;
                const hitX = x + Math.abs((wall - y) / slope);
                if (hitX >= right) {
                    points.push({ x: right, y: y + direction * slope * (right - x) });
                    break;
                }
                points.push({ x: hitX, y: wall });
                x = hitX;
                y = wall;
                if (!guided) {
                    escaped = true;
                    const escapeY = direction > 0 ? bottom + height * .13 : top - height * .13;
                    const escapeX = Math.min(right, x + Math.abs((escapeY - y) / slope));
                    points.push({ x: escapeX, y: escapeY });
                    break;
                }
                direction *= -1;
            }
        } else {
            points.push({ x: right, y: center });
        }

        ctx.save();
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = guided ? '#55e7ed' : '#ffb279';
        ctx.shadowColor = guided ? '#3edbea' : '#ff9c5c';
        ctx.shadowBlur = 13;
        ctx.beginPath();
        points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
        ctx.stroke();
        ctx.restore();

        const lengths = [];
        let totalLength = 0;
        for (let i = 1; i < points.length; i++) {
            const length = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
            lengths.push(length);
            totalLength += length;
        }
        if (totalLength > 0) {
            let distance = reducedMotion ? totalLength * .56 : (t * 115) % totalLength;
            for (let i = 0; i < lengths.length; i++) {
                if (distance <= lengths[i]) {
                    const start = points[i];
                    const end = points[i + 1];
                    const fraction = distance / lengths[i];
                    glowDot(start.x + (end.x - start.x) * fraction, start.y + (end.y - start.y) * fraction, guided ? '#f0ffff' : '#fff0df', 5);
                    break;
                }
                distance -= lengths[i];
            }
        }
        ctx.strokeStyle = '#f8cf72';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(left + 10, center);
        ctx.lineTo(left + 10 + Math.min(width * .24, height * .45), center + Math.tan(Math.min(values.launchAngle, 68) * Math.PI / 180) * Math.min(width * .24, height * .45));
        ctx.stroke();
        label(`θ = ${values.launchAngle}°`, left + 18, center + 28, '#f8d47e', 11);
        if (escaped) label('refracted into cladding', Math.min(right - 8, points.at(-1).x), Math.min(height - 12, points.at(-1).y + 16), '#ffc08e', 9, 'right');
    }

    function drawQuantumWell(t, values) {
        const n = values.level;
        const left = width * .21;
        const right = width * .91;
        const graphWidth = right - left;
        const waveCenter = height * .38;
        const waveAmplitude = height * .15;
        const probabilityBase = height * .86;
        const probabilityAmplitude = height * .15;
        const phase = reducedMotion ? 0 : Math.cos(t * (1 + n * .45));

        label('ENERGY LEVELS', width * .04, height * .16, '#9aafc9', 9);
        for (let level = 1; level <= 4; level++) {
            const y = height * .82 - level * height * .105;
            ctx.strokeStyle = level === n ? '#55ddeb' : 'rgba(141,166,198,.32)';
            ctx.lineWidth = level === n ? 3 : 1;
            ctx.beginPath();
            ctx.moveTo(width * .045, y);
            ctx.lineTo(width * .17, y);
            ctx.stroke();
            label(`E${level}`, width * .04, y - 7, level === n ? '#83f2ff' : '#8192aa', 9);
        }

        ctx.strokeStyle = '#9ab0ca';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(left, height * .17);
        ctx.lineTo(left, height * .9);
        ctx.lineTo(right, height * .9);
        ctx.lineTo(right, height * .17);
        ctx.stroke();
        label('ψ(x,t)', left + 8, height * .19, '#9ae9ff', 10);
        label('|ψ|²', left + 8, probabilityBase - probabilityAmplitude - 8, '#69e8b4', 10);

        ctx.lineWidth = 2.7;
        ctx.strokeStyle = '#42deeb';
        ctx.beginPath();
        const samples = Math.max(100, Math.round(graphWidth / 2));
        for (let i = 0; i <= samples; i++) {
            const position = i / samples;
            const x = left + position * graphWidth;
            const y = waveCenter - Math.sin(n * Math.PI * position) * phase * waveAmplitude;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();

        ctx.save();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(101,235,180,.78)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const position = i / samples;
            const x = left + position * graphWidth;
            const density = 2 * Math.sin(n * Math.PI * position) ** 2;
            const y = probabilityBase - density * probabilityAmplitude;
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
        label('dashed: probability density', right - 5, height * .98, '#70e6b5', 9, 'right');
    }

    function tunnelingProbability(values) {
        const ratio = values.energyRatio;
        const kappaA = values.barrierWidth * Math.sqrt(1 - ratio);
        const denominator = 1 + Math.sinh(kappaA) ** 2 / (4 * ratio * (1 - ratio));
        return 1 / denominator;
    }

    function tunnelingReading(values) {
        return `Approx. transmission probability: ${(tunnelingProbability(values) * 100).toFixed(1)}%`;
    }

    function drawTunneling(t, values) {
        const probability = tunnelingProbability(values);
        const barrierLeft = width * .47;
        const barrierWidth = width * (.07 + (values.barrierWidth - .4) / 1.6 * .12);
        const barrierRight = barrierLeft + barrierWidth;
        const base = height * .77;
        const top = height * .22;
        const energyY = base - (base - top) * values.energyRatio;
        const phase = reducedMotion ? 0 : t * 3.1;

        ctx.strokeStyle = 'rgba(176,194,220,.68)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(width * .08, base);
        ctx.lineTo(width * .93, base);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,133,118,.22)';
        ctx.fillRect(barrierLeft, top, barrierWidth, base - top);
        ctx.strokeStyle = 'rgba(255,158,131,.78)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barrierLeft, top, barrierWidth, base - top);
        label('POTENTIAL BARRIER', (barrierLeft + barrierRight) / 2, top - 10, '#ffc2ad', 9, 'center');

        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#f6dc7e';
        ctx.beginPath();
        ctx.moveTo(width * .09, energyY);
        ctx.lineTo(width * .93, energyY);
        ctx.stroke();
        ctx.restore();
        label('E', width * .075, energyY - 6, '#f6dc7e', 11);
        label(`E / V₀ = ${values.energyRatio.toFixed(2)}`, width * .91, energyY - 9, '#f6dc7e', 10, 'right');

        const centerY = height * .55;
        const amplitude = height * .085;
        const packetWidth = width * .085;
        function wavePacket(startX, endX, centerX, strength, direction, color, packetPhase) {
            ctx.beginPath();
            let started = false;
            const step = 2;
            for (let x = startX; x <= endX; x += step) {
                const envelope = strength * Math.exp(-(((x - centerX) / packetWidth) ** 2));
                const y = centerY - envelope * Math.sin((x - centerX) * .13 * direction - packetPhase);
                if (!started) {
                    ctx.moveTo(x, y);
                    started = true;
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        const incomingCenter = Math.min(barrierLeft - packetWidth * .5, width * .27 + Math.sin(phase) * width * .035);
        const reflectedCenter = barrierLeft - packetWidth * .75 - Math.sin(phase) * width * .018;
        const transmittedCenter = barrierRight + packetWidth * .75 + Math.sin(phase) * width * .025;
        wavePacket(width * .08, barrierLeft - 1, incomingCenter, 1, 1, '#63def0', phase);
        wavePacket(width * .08, barrierLeft - 1, reflectedCenter, Math.sqrt(1 - probability), -1, '#bd9eff', -phase);
        ctx.save();
        ctx.beginPath();
        ctx.rect(barrierLeft, top, barrierWidth, base - top);
        ctx.clip();
        for (let x = barrierLeft + 2; x < barrierRight; x += 9) {
            const progress = (x - barrierLeft) / barrierWidth;
            const decay = Math.exp(-progress * values.barrierWidth * 2.2);
            const y = centerY - amplitude * decay * Math.sin((x - barrierLeft) * .13 - phase);
            glowDot(x, y, 'rgba(255,197,154,.9)', 2.5);
        }
        ctx.restore();
        wavePacket(barrierRight + 1, width * .93, transmittedCenter, Math.sqrt(probability), 1, '#69efb7', phase);
        label('INCIDENT', width * .12, height * .91, '#78deed', 9);
        label('REFLECTED', barrierLeft - 8, height * .91, '#c1a8ff', 9, 'right');
        label('TRANSMITTED', width * .92, height * .91, '#78edbd', 9, 'right');
    }

    function label(text, x, y, color = '#a9bed8', size = 11, align = 'left') {
        ctx.save();
        ctx.font = `600 ${size}px "DM Sans", "Segoe UI", sans-serif`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function glowDot(x, y, color, radius = 5) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function render(now) {
        if (!ctx || !width || !height) return;
        drawBackground();
        experiments[activeId].draw(now / 1000, activeValues);
    }

    function animate(now) {
        frameId = 0;
        if (!ctx || document.hidden || !inView) return;
        render(now);
        if (!reducedMotion) frameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!ctx || reducedMotion || document.hidden || !inView || frameId) return;
        frameId = requestAnimationFrame(animate);
    }

    root.querySelectorAll('[data-home-simulation]').forEach(button => {
        button.addEventListener('click', () => selectExperiment(button.dataset.homeSimulation));
    });
    if (ctx) {
        new ResizeObserver(resize).observe(canvas);
        const visibilityObserver = new IntersectionObserver(entries => {
            inView = entries.some(entry => entry.isIntersecting);
            if (inView) {
                render(performance.now());
                startAnimation();
            } else if (frameId) {
                cancelAnimationFrame(frameId);
                frameId = 0;
            }
        }, { threshold: .05 });
        visibilityObserver.observe(root);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && frameId) {
                cancelAnimationFrame(frameId);
                frameId = 0;
            } else {
                startAnimation();
            }
        });
    }
    selectExperiment(activeId);
})();
