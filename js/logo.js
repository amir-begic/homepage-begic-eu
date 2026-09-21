// The begic.eu mark floating in front of the stars.
//
// three.js r160 ships no TextGeometry in its UMD build, so the letterforms are built a
// different way: the text is drawn to an offscreen canvas, blurred, and fed to a dense
// plane as a displacement map. The letters become real raised geometry - they catch the
// lights, and the blur is what gives them their rounded, inflated edge.

var logoCanvas = document.querySelector('#logo');
var logoScene, logoCamera, logoRenderer, logoMesh, logoClock;

var logoText = 'begic.eu';
var logoSegments = 420;          // displacement happens per vertex, so this has to be dense
var logoBlur = 9;                // rounds the relief off; too much and the letters merge
var logoDepth = 30;              // how far the letters stand off the plane
var logoOpacity = 0.34;          // see-through enough to read a page underneath
var logoWidthShare = 0.92;       // of the width the camera sees; the glyphs fill ~65% of that
var logoHeightCap = 0.42;        // ...unless that would make it too tall for the star ring

// a scroll or a press of SPIN shoves the letters out of shape and they ease back. kept
// on its own timer rather than reading the star speed, so it can be tuned by itself.
// logoShove is allowed past 1 - the visible distortion clamps there, so a big shove holds
// at full for a beat before it starts easing off
var logoShove = 0;
var logoScrollBoost = 0.34;      // per wheel event
var logoScrollMax = 1.15;
var logoSpinShove = 2.0;         // SPIN is the bigger gesture, so it rides at full longer
var logoDistortDecay = 1.1;      // per second, time based so frame rate cannot skew it
var logoMaxStep = 0.1;           // biggest time step honoured, so a backgrounded tab
                                 // does not snap the letters straight on return
var logoLastTime = 0;
var logoUniforms = {uDistort: {value: 0}, uTime: {value: 0}};
var logoBaseScale = 1;

// two rasterisations of the same text: a sharp one to cut the silhouette, and a blurred
// one to shape the relief. sharing a single blurred map was what turned this into a blob
function logoTextMap(blur){
    let c = document.createElement('canvas');
    c.width = 2048;
    c.height = 512;

    let g = c.getContext('2d');
    g.fillStyle = 'black';
    g.fillRect(0, 0, c.width, c.height);

    if (blur){
        g.filter = 'blur(' + blur + 'px)';
    }

    g.fillStyle = 'white';
    g.font = '300px eurocine-regular, Arial, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(logoText, c.width / 2, c.height / 2);

    return c;
}

// displacementMap moves vertices but leaves the normals flat, so the relief catches no
// light on its own. this derives normals from the blurred map with a Sobel pass, which is
// what actually makes the letters read as inflated rather than as flat cut-outs
function logoNormalMap(source, strength){
    let w = source.width;
    let h = source.height;
    let src = source.getContext('2d').getImageData(0, 0, w, h).data;

    let out = document.createElement('canvas');
    out.width = w;
    out.height = h;

    let g = out.getContext('2d');
    let img = g.createImageData(w, h);

    let at = function(x, y){
        let cx = x < 0 ? 0 : (x > w - 1 ? w - 1 : x);
        let cy = y < 0 ? 0 : (y > h - 1 ? h - 1 : y);
        return src[(cy * w + cx) * 4] / 255;
    };

    for (let y = 0; y < h; y++){
        for (let x = 0; x < w; x++){
            let dx = (at(x + 1, y) - at(x - 1, y)) * strength;
            let dy = (at(x, y + 1) - at(x, y - 1)) * strength;
            let len = Math.sqrt(dx * dx + dy * dy + 1);
            let i = (y * w + x) * 4;

            img.data[i]     = ((-dx / len) * 0.5 + 0.5) * 255;
            img.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
            img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
            img.data[i + 3] = 255;
        }
    }

    g.putImageData(img, 0, 0);
    return out;
}

// glass with nothing to reflect looks like grey plastic, so give the scene a cheap
// environment: a vertical gradient standing in for sky above and the blue field below
function logoEnvironment(){
    let c = document.createElement('canvas');
    c.width = 16;
    c.height = 256;

    let g = c.getContext('2d');
    let grad = g.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#cfe0ff');
    grad.addColorStop(0.55, '#1f5ba8');
    grad.addColorStop(1, '#00203f');
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);

    let tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

function buildLogo(){
    logoScene = new THREE.Scene();
    logoScene.environment = logoEnvironment();

    logoCamera = new THREE.PerspectiveCamera(32, 1, 1, 2000);
    logoCamera.position.set(0, 0, 720);

    logoRenderer = new THREE.WebGLRenderer({canvas: logoCanvas, alpha: true, antialias: true});
    logoRenderer.setClearColor(0x000000, 0);

    let reliefSource = logoTextMap(logoBlur);
    let relief = new THREE.CanvasTexture(reliefSource);
    let cutout = new THREE.CanvasTexture(logoTextMap(0));
    let normals = new THREE.CanvasTexture(logoNormalMap(reliefSource, 26));
    relief.colorSpace = THREE.NoColorSpace;
    cutout.colorSpace = THREE.NoColorSpace;
    normals.colorSpace = THREE.NoColorSpace;

    // transmission is the "correct" way to do glass, but it samples the scene behind the
    // mesh - and the page here is a separate canvas, not scene geometry, so there is
    // nothing to refract and it just washed the relief out flat. plain opacity keeps the
    // shading and the highlights, and the clearcoat is what sells it as glass
    let material = new THREE.MeshPhysicalMaterial({
        color: 0xf2f7ff,
        roughness: 0.08,
        metalness: 0,
        envMapIntensity: 2.6,
        transparent: true,
        opacity: logoOpacity,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        specularIntensity: 1,
        reflectivity: 1,
        displacementMap: relief,
        displacementScale: logoDepth,
        normalMap: normals,
        normalScale: new THREE.Vector2(2.4, 2.4),
        alphaMap: cutout,
        // alphaTest compares the FINAL alpha, which is opacity x alphaMap - so a fixed
        // 0.5 threshold discarded the entire mesh once the material turned see-through
        alphaTest: logoOpacity * 0.5,
        side: THREE.FrontSide
    });

    // the distortion is injected into the stock vertex shader rather than done with a
    // filter, so the letters really deform: a slow wobble stretches them and a hashed
    // grain that re-rolls 24 times a second breaks the surface up
    material.onBeforeCompile = function(shader){
        shader.uniforms.uDistort = logoUniforms.uDistort;
        shader.uniforms.uTime = logoUniforms.uTime;

        shader.vertexShader = 'uniform float uDistort;\nuniform float uTime;\n' +
            'float logoHash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' +
            shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <displacementmap_vertex>',
            [
                '#include <displacementmap_vertex>',
                'if (uDistort > 0.001) {',
                '  float grain = logoHash(floor(vec2(transformed.x, transformed.y) * 0.7) + floor(uTime * 24.0));',
                '  float wobble = sin(transformed.x * 0.045 + uTime * 5.0) * cos(transformed.y * 0.085 - uTime * 3.5);',
                '  transformed.z += (wobble * 26.0 + (grain - 0.5) * 34.0) * uDistort;',
                '  transformed.x += (grain - 0.5) * 18.0 * uDistort;',
                '  transformed.y += (wobble * 4.0) * uDistort;',
                '}'
            ].join('\n')
        );
    };

    logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(720, 180, logoSegments, logoSegments / 4), material);
    logoScene.add(logoMesh);

    logoScene.add(new THREE.AmbientLight(0xbfd4ff, 0.5));

    let rim = new THREE.DirectionalLight(0xffffff, 3.0);
    rim.position.set(420, -260, -380);
    logoScene.add(rim);

    let key = new THREE.DirectionalLight(0xffffff, 5.5);
    key.position.set(-260, 320, 520);
    logoScene.add(key);

    let warm = new THREE.PointLight(0xfdcb0b, 3.4, 2200);
    warm.position.set(340, -200, 420);
    logoScene.add(warm);

    logoClock = new THREE.Clock();
    resizeLogo();
    drawLogo();
}

function resizeLogo(){
    if (!logoRenderer){
        return;
    }

    logoRenderer.setPixelRatio(window.devicePixelRatio);
    logoRenderer.setSize(window.innerWidth, window.innerHeight, false);
    logoCamera.aspect = window.innerWidth / window.innerHeight;

    logoCamera.updateProjectionMatrix();

    // size against what the camera can actually see, not against pixel counts. the fov is
    // vertical, so pixels-per-world-unit is set by the window height - scaling by width as
    // well double counted it, and the mark ran off the sides of a tall 4k display
    let visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(logoCamera.fov) / 2) * logoCamera.position.z;
    let visibleWidth = visibleHeight * logoCamera.aspect;

    let byWidth = (visibleWidth * logoWidthShare) / 720;
    let byHeight = (visibleHeight * logoHeightCap) / 180;

    logoBaseScale = Math.min(byWidth, byHeight);
    logoMesh.scale.setScalar(logoBaseScale);
}

function drawLogo(){
    let t = logoClock.getElapsedTime();

    let dt = Math.min(logoMaxStep, t - logoLastTime);
    logoLastTime = t;

    logoShove = Math.max(0, logoShove - logoDistortDecay * dt);

    logoUniforms.uTime.value = t;
    logoUniforms.uDistort.value = Math.min(1, logoShove);

    // the stretch rides the same value, so it slackens off as the noise settles
    logoMesh.scale.x = logoBaseScale * (1 + logoUniforms.uDistort.value * 0.55);

    // a slow drift rather than a full tumble - it is a flat-backed relief, not a solid
    logoMesh.rotation.y = Math.sin(t * 0.32) * 0.42;
    logoMesh.rotation.x = Math.sin(t * 0.23) * 0.13;
    logoMesh.position.y = Math.sin(t * 0.45) * 8;

    // being glass it can stay put over an open panel - it only steps back enough to keep
    // the copy underneath comfortable to read
    if (window.panel){
        logoCanvas.style.opacity = 1 - panel.progress * 0.45;
    }

    logoRenderer.render(logoScene, logoCamera);
    requestAnimationFrame(drawLogo);
}

// the mark is drawn in the site font, so wait for it before rasterising the height map
if (document.fonts && document.fonts.load){
    document.fonts.load('260px eurocine-regular').then(buildLogo, buildLogo);
}else{
    buildLogo();
}

window.addEventListener('resize', resizeLogo);

window.addEventListener('wheel', function(){
    logoShove = Math.min(logoScrollMax, logoShove + logoScrollBoost);
});

document.querySelector('#spinbutton').addEventListener('click', function(){
    logoShove = logoSpinShove;
});

