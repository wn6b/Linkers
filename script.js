// 1. إعداد محرك Three.js
const canvas = document.getElementById('gl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const mouse = new THREE.Vector2(0.5, 0.5);
const targetMouse = new THREE.Vector2(0.5, 0.5);

// 2. برمجة الشيدر (GLSL) لمحاكاة البلازما الواقعية
const vertexShader = `
    void main() {
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;

    void main() {
        // تهيئة الإحداثيات
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        vec2 m = uMouse * 2.0 - 1.0;
        m.x *= uResolution.x / uResolution.y;

        // تأثير البلازما الكونية
        vec3 col = vec3(0.0);
        float d = length(uv - m);

        for(float i = 1.0; i < 5.0; i++) {
            uv.x += sin(uTime * 0.2 + uv.y * 1.5 + i) * 0.4;
            uv.y += cos(uTime * 0.3 + uv.x * 1.5 + i) * 0.4;
            
            // حساب الكثافة اللونية (نيون سايبربانك)
            float intensity = abs(1.0 / (uv.y * 12.0));
            col += vec3(intensity * 0.05, intensity * 0.4, intensity * 0.6) / i;
        }

        // تفاعل الإضاءة مع اللمس/الماوس (Glow)
        col += vec3(0.0, 0.8, 1.0) * (0.08 / (d + 0.1));

        // تعتيم الحواف (Vignette)
        float vignette = length(gl_FragCoord.xy / uResolution.xy - 0.5);
        col *= smoothstep(0.8, 0.2, vignette);

        gl_FragColor = vec4(col * 1.2, 1.0);
    }
`;

// 3. بناء السطح وتطبيق المادة الفيزيائية
const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uMouse: { value: mouse }
    }
});

scene.add(new THREE.Mesh(geometry, material));

// 4. تتبع حركة الماوس واللمس بدقة
function updateInteraction(clientX, clientY) {
    targetMouse.x = clientX / window.innerWidth;
    targetMouse.y = 1.0 - (clientY / window.innerHeight);
}

window.addEventListener('mousemove', (e) => updateInteraction(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateInteraction(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });
window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) updateInteraction(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// إعادة تحجيم الشاشة
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// 5. حلقة الرندر المستمرة (Animation Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // حركة ناعمة للسائل (Lerp)
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    
    material.uniforms.uTime.value += 0.015;
    material.uniforms.uMouse.value = mouse;

    renderer.render(scene, camera);
}

// 6. إضافة تأثير الإمالة الثلاثية الأبعاد للبطاقات (3D Tilt Effect)
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    // للكمبيوتر
    card.addEventListener('mousemove', (e) => applyTilt(e.clientX, e.clientY, card));
    card.addEventListener('mouseleave', () => resetTilt(card));
    
    // للموبايل
    card.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) applyTilt(e.touches[0].clientX, e.touches[0].clientY, card);
    }, {passive: true});
    card.addEventListener('touchend', () => resetTilt(card));
});

function applyTilt(clientX, clientY, card) {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -20; // زاوية الميلان
    const rotateY = ((x - centerX) / centerX) * 20;
    
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
}

function resetTilt(card) {
    card.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
}

animate();