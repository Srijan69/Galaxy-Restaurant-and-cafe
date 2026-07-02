/* ============================================
   GALAXY CAFÉ — 3D CINEMATIC INTRO (Three.js)
   Self-contained. Smooth, frame-rate-independent, performant on mobile.
   - Dark elegant bg + two-layer parallax golden particles w/ twinkle
   - Rotating metallic gold "Galaxy Café" logo with soft entrance
   - Floating 3D elements (dosa, coffee cup, jasmine) that ease in
   - Slow cinematic camera dolly + subtle pointer/gyro parallax
   - Auto fade-out ~5.5s, Skip button, runs once per session
   ============================================ */
(function () {
    'use strict';

    var OVERLAY_ID = 'galaxy-intro';
    var SESSION_KEY = 'gc_intro_seen';      // sessionStorage -> once per browser session
    var AUTO_MS = 5500;                       // play length before auto fade-out
    var FADE_MS = 1300;                       // must match CSS exit transition (~1.3s)

    var overlay = document.getElementById(OVERLAY_ID);
    if (!overlay) return;

    // --- Run-once guard: if already seen this session, remove instantly. ---
    var alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) {}
    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (alreadySeen) {
        overlay.parentNode && overlay.parentNode.removeChild(overlay);
        return;
    }

    // Lock body scroll while the intro plays.
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    var finished = false;
    function finish() {
        if (finished) return;
        finished = true;
        try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
        document.body.style.overflow = prevOverflow || '';
        overlay.classList.add('gi-hidden');
        setTimeout(function () {
            try { teardown && teardown(); } catch (e) {}
            overlay.parentNode && overlay.parentNode.removeChild(overlay);
        }, FADE_MS + 60);
    }

    // Skip button always works, even if WebGL fails to init.
    var skipBtn = document.getElementById('galaxy-intro-skip');
    if (skipBtn) skipBtn.addEventListener('click', finish);
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !finished) finish();
    });

    var teardown = null;

    function boot() {
        if (typeof THREE === 'undefined') { finish(); return; }   // graceful fallback
        if (reduceMotion) { AUTO_MS = 2200; }

        var canvas = document.getElementById('galaxy-intro-canvas');
        var W = window.innerWidth, H = window.innerHeight;
        var isMobile = Math.min(W, H) < 700 ||
            /Mobi|Android/i.test(navigator.userAgent);

        var renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas: canvas, antialias: true, alpha: true,
                powerPreference: 'high-performance'
            });
        } catch (e) { finish(); return; }

        // Render at the device's real pixel density (capped at 2 for perf) so
        // the scene is crisp on high-DPI phones instead of upscaled/blurry.
        // The previous 1.5 cap on mobile was a major cause of the soft look.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H);

        var scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0a0a, 0.03);

        var camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        camera.position.set(0, 0, 13);

        // ---- Lighting ----
        scene.add(new THREE.AmbientLight(0x4a3c20, 0.9));
        var key = new THREE.PointLight(0xffe8b0, 2.2, 60);
        key.position.set(6, 8, 10); scene.add(key);
        var rim = new THREE.PointLight(0xC9A962, 1.6, 60);
        rim.position.set(-8, -4, 6); scene.add(rim);
        var fill = new THREE.DirectionalLight(0xE8D5A3, 0.5);
        fill.position.set(0, 5, -8); scene.add(fill);

        var GOLD = 0xC9A962, GOLD_LIGHT = 0xE8D5A3, GOLD_DARK = 0x9A7B3D;
        function goldMat(opts) {
            return new THREE.MeshStandardMaterial(Object.assign({
                color: GOLD, metalness: 1.0, roughness: 0.28,
                emissive: GOLD_DARK, emissiveIntensity: 0.12
            }, opts || {}));
        }

        // group holds logo + floaters so we can parallax them together
        var group = new THREE.Group();
        scene.add(group);

        // ---------- Two-layer parallax golden particles (with twinkle) ----------
        function makeParticleLayer(count, spread, size, opacity) {
            var geo = new THREE.BufferGeometry();
            var pos = new Float32Array(count * 3);
            var seed = new Float32Array(count); // twinkle phase
            for (var i = 0; i < count; i++) {
                pos[i*3]   = (Math.random() - 0.5) * spread;
                pos[i*3+1] = (Math.random() - 0.5) * (spread * 0.66);
                pos[i*3+2] = (Math.random() - 0.5) * (spread * 0.66) - 4;
                seed[i] = Math.random() * Math.PI * 2;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            var pts = new THREE.Points(geo, new THREE.PointsMaterial({
                color: GOLD_LIGHT, size: size, transparent: true, opacity: opacity,
                blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
            }));
            pts.userData.seed = seed;
            pts.userData.geo = geo;
            return pts;
        }
        var pNear = makeParticleLayer(isMobile ? 180 : 420, 30, isMobile ? 0.075 : 0.065, 0.9);
        var pFar  = makeParticleLayer(isMobile ? 120 : 280, 46, isMobile ? 0.045 : 0.04, 0.5);
        scene.add(pNear); scene.add(pFar);

        // ---------- Metallic gold "Galaxy Café" logo (canvas texture) ----------
        function makeLogo() {
            var c = document.createElement('canvas');
            // Supersample the label texture (2x) so the metallic text stays
            // crisp when the logo plane is drawn large on high-DPI / desktop
            // screens. ctx.scale lets the drawing code keep 1024x512 coords
            // while the actual bitmap is 2048x1024 -> sharp, mip-mapped text.
            var SS = 2;
            c.width = 1024 * SS; c.height = 512 * SS;
            var ctx = c.getContext('2d');
            ctx.scale(SS, SS);
            var grad = ctx.createLinearGradient(0, 120, 0, 400);
            grad.addColorStop(0, '#F5E6B8');
            grad.addColorStop(0.5, '#C9A962');
            grad.addColorStop(1, '#9A7B3D');
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(201,169,98,0.6)'; ctx.shadowBlur = 32;
            ctx.fillStyle = grad;
            ctx.font = '700 150px "Playfair Display", Georgia, serif';
            ctx.fillText('Galaxy', 512, 180);
            ctx.shadowBlur = 18;
            ctx.font = '700 84px "Playfair Display", Georgia, serif';
            ctx.fillText('Restaurant And Cafe', 512, 360);
            ctx.shadowBlur = 12; ctx.strokeStyle = '#C9A962'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(360, 268); ctx.lineTo(664, 268); ctx.stroke();

            var tex = new THREE.CanvasTexture(c);
            tex.anisotropy = renderer.capabilities.getMaxAnisotropy ?
                renderer.capabilities.getMaxAnisotropy() : 1;
            var mat = new THREE.MeshStandardMaterial({
                map: tex, transparent: true, side: THREE.DoubleSide,
                metalness: 0.7, roughness: 0.3,
                emissive: 0xC9A962, emissiveIntensity: 0.25, emissiveMap: tex,
                opacity: 0
            });
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.5), mat);
            return { mesh: plane, tex: tex, mat: mat };
        }
        var logo = makeLogo();
        group.add(logo.mesh);

        // ---------- Stylized 3D elements ----------
        // each floater gets a staggered eased entrance (scale + fade)
        var floaters = [];
        function addFloater(mesh, pos, spin, delay) {
            mesh.position.set(pos[0], pos[1], pos[2]);
            mesh.userData.spin = spin;
            mesh.userData.base = pos.slice();
            mesh.userData.phase = Math.random() * Math.PI * 2;
            mesh.userData.delay = delay;     // seconds before it eases in
            mesh.scale.setScalar(0.001);
            group.add(mesh);
            floaters.push(mesh);
        }

        // Dosa
        var dosa = new THREE.Group();
        var roll = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.30, 1.7, 24, 1, true),
            goldMat({ roughness: 0.45, side: THREE.DoubleSide }));
        roll.rotation.z = Math.PI / 2.2; dosa.add(roll);
        var plate = new THREE.Mesh(
            new THREE.TorusGeometry(0.9, 0.06, 12, 40), goldMat({ roughness: 0.5 }));
        plate.rotation.x = Math.PI / 2; plate.position.y = -0.35; dosa.add(plate);
        addFloater(dosa, [-4.6, 1.7, -1], [0.25, 0.5, 0], 0.6);

        // Coffee cup
        var cup = new THREE.Group();
        cup.add(new THREE.Mesh(
            new THREE.CylinderGeometry(0.42, 0.32, 0.6, 28, 1, false), goldMat({ roughness: 0.25 })));
        var handle = new THREE.Mesh(
            new THREE.TorusGeometry(0.22, 0.05, 12, 28), goldMat({ roughness: 0.3 }));
        handle.position.set(0.5, 0, 0); cup.add(handle);
        var saucer = new THREE.Mesh(
            new THREE.CylinderGeometry(0.62, 0.62, 0.05, 28), goldMat({ roughness: 0.4 }));
        saucer.position.y = -0.34; cup.add(saucer);
        addFloater(cup, [4.7, 1.4, -1.2], [0, 1.0, 0], 0.85);

        // Jasmine
        function makeJasmine() {
            var j = new THREE.Group();
            var petalMat = goldMat({ color: GOLD_LIGHT, roughness: 0.35 });
            for (var p = 0; p < 6; p++) {
                var ang = (p / 6) * Math.PI * 2;
                var petal = new THREE.Mesh(new THREE.SphereGeometry(0.20, 16, 16), petalMat);
                petal.position.set(Math.cos(ang) * 0.30, Math.sin(ang) * 0.30, 0);
                petal.scale.set(1, 0.55, 0.55); petal.rotation.z = ang;
                j.add(petal);
            }
            j.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16),
                goldMat({ color: GOLD_DARK, roughness: 0.4 })));
            return j;
        }
        addFloater(makeJasmine(), [-3.8, -2.0, 0.3], [0.33, 0.66, 0.33], 1.1);
        addFloater(makeJasmine(), [3.9, -2.1, 0.2], [0.4, -0.6, 0], 1.35);

        // ---------- Subtle pointer / gyro parallax ----------
        var targetPX = 0, targetPY = 0, curPX = 0, curPY = 0;
        function onPointer(e) {
            targetPX = (e.clientX / W - 0.5) * 0.6;
            targetPY = (e.clientY / H - 0.5) * 0.4;
        }
        function onOrient(e) {
            if (e.gamma == null) return;
            targetPX = Math.max(-0.6, Math.min(0.6, (e.gamma / 45) * 0.6));
            targetPY = Math.max(-0.4, Math.min(0.4, (e.beta - 45) / 90 * 0.4));
        }
        window.addEventListener('pointermove', onPointer);
        window.addEventListener('deviceorientation', onOrient);

        // ---------- Responsive fit ----------
        // The logo + floaters are authored for a wide (landscape) frame. On a
        // portrait phone the horizontal field of view collapses, which would
        // clip the logo text and the side floaters. Instead of relying on a
        // fixed size, we measure how much world-space is actually visible at
        // the content's resting distance and scale the whole content group so
        // it is always fully *contained* — on any screen ratio, dynamically.
        var CONTENT_HW = 4.2;   // horizontal half-extent that must stay visible
        var CONTENT_HH = 2.4;   // vertical half-extent that must stay visible
        var FIT_DIST   = 9.4;   // camera's resting distance to the content plane
        function computeFit() {
            var aspect  = W / H;
            var vHalf   = Math.tan((camera.fov * Math.PI / 180) / 2);
            var availHH = FIT_DIST * vHalf;      // visible half-height (world units)
            var availHW = availHH * aspect;      // visible half-width  (world units)
            // reserve headroom for the cinematic orbit + pointer/gyro parallax
            var panX = isMobile ? 0.7 : 1.2;
            var panY = isMobile ? 0.6 : 0.8;
            var scale = Math.min(
                (availHW - panX) / CONTENT_HW,
                (availHH - panY) / CONTENT_HH
            );
            // contain only: never upscale past the design size, never vanish
            group.scale.setScalar(Math.max(0.34, Math.min(scale, 1)));
        }

        // ---------- Resize / orientation ----------
        function onResize() {
            W = window.innerWidth; H = window.innerHeight;
            camera.aspect = W / H; camera.updateProjectionMatrix();
            renderer.setSize(W, H);
            computeFit();
        }
        computeFit();                                   // set initial framing
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);

        // signal CSS to fade the canvas in, and reveal scene next frame
        requestAnimationFrame(function () { overlay.classList.add('gi-ready'); });

        function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

        // ---------- Animation loop (delta-time = smooth on any FPS) ----------
        var start = performance.now();
        var last = start;
        var raf = 0;
        function tick(now) {
            var t = (now - start) / 1000;
            var dt = Math.min((now - last) / 1000, 0.05); // clamp to avoid jumps after stalls
            last = now;

            // Slow cinematic dolly with easeOutCubic, gentle orbit + pointer parallax
            var intro = Math.min(t / 3.4, 1);
            var eased = easeOutCubic(intro);
            curPX += (targetPX - curPX) * Math.min(dt * 3, 1);
            curPY += (targetPY - curPY) * Math.min(dt * 3, 1);
            camera.position.z = 13 - eased * 3.6;            // 13 -> ~9.4
            camera.position.x = Math.sin(t * 0.16) * 0.9 + curPX;
            camera.position.y = Math.cos(t * 0.13) * 0.5 - curPY;
            camera.lookAt(0, 0, 0);

            // Logo: soft fade-in, slow metallic rotation + bob
            logo.mat.opacity = Math.min(logo.mat.opacity + dt * 0.9, 1);
            logo.mesh.rotation.y = Math.sin(t * 0.32) * 0.5;
            logo.mesh.rotation.x = Math.sin(t * 0.22) * 0.07;
            logo.mesh.position.y = Math.sin(t * 0.55) * 0.12;

            // Floaters: staggered eased pop-in, then self-spin (radians/sec) + drift
            for (var k = 0; k < floaters.length; k++) {
                var f = floaters[k], s = f.userData.spin, b = f.userData.base;
                var local = Math.max(0, Math.min((t - f.userData.delay) / 1.1, 1));
                var sc = easeOutCubic(local);
                f.scale.setScalar(0.001 + sc);
                f.rotation.x += s[0] * dt; f.rotation.y += s[1] * dt; f.rotation.z += s[2] * dt;
                f.position.y = b[1] + Math.sin(t * 0.8 + f.userData.phase) * 0.25;
            }

            // Particle drift + twinkle (opacity pulse via shared material is cheap)
            pNear.rotation.y = t * 0.02;  pNear.rotation.x = Math.sin(t * 0.1) * 0.05;
            pFar.rotation.y  = -t * 0.012; pFar.rotation.x  = Math.cos(t * 0.08) * 0.04;
            pNear.material.opacity = 0.78 + Math.sin(t * 1.6) * 0.14;
            pFar.material.opacity  = 0.42 + Math.sin(t * 1.2 + 1) * 0.1;
            // parallax: particle layers counter-move with pointer for depth
            pNear.position.x = curPX * 0.6; pNear.position.y = -curPY * 0.6;
            pFar.position.x  = curPX * 1.4; pFar.position.y  = -curPY * 1.4;

            renderer.render(scene, camera);
            raf = requestAnimationFrame(tick);
        }
        raf = requestAnimationFrame(tick);

        var autoTimer = setTimeout(finish, AUTO_MS);

        // ---------- Teardown ----------
        teardown = function () {
            clearTimeout(autoTimer);
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
            window.removeEventListener('pointermove', onPointer);
            window.removeEventListener('deviceorientation', onOrient);
            scene.traverse(function (o) {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    var m = o.material;
                    (Array.isArray(m) ? m : [m]).forEach(function (mm) {
                        if (mm.map) mm.map.dispose();
                        mm.dispose();
                    });
                }
            });
            renderer.dispose();
        };
    }

    // Wait for fonts so the canvas logo renders in Playfair Display, with a hard cap.
    var booted = false;
    function safeBoot() { if (booted) return; booted = true; boot(); }
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(safeBoot);
        setTimeout(safeBoot, 600);
    } else {
        safeBoot();
    }
})();
