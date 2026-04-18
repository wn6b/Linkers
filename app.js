// إعداد مشهد الـ 3D الأساسي
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// متغيرات التتبع
const mouse = new THREE.Vector2(0.5, 0.5);
const targetMouse = new THREE.Vector2(0.5, 0.5);
let time = 0;

// الشيدرات السحرية (GLSL) - تولد سائل ضوئي فائق الواقعية
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // دالة لتوليد تموجات واقعية
    mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= uResolution.x / uResolution.y;

        vec2 m = uMouse * 2.0 - 1.0;
        m.x *= uResolution.x / uResolution.y;

        // تأثير السحب من الماوس
        float d = length(uv - m);
        vec2 p = uv;
        p -= m;
        p *= rot(d * 2.0 - uTime * 0.5);
        p += m;

        // ألوان السائل (نيون، أزرق، ووردي بلمسة داكنة)
        vec3 color = vec3(0.0);
        for(float i = 1.0; i < 4.0; i++) {
            p.x += sin(uTime * 0.3 + p.y * i) * 0.5;
            p.y += cos(uTime * 0.2 + p.x * i) * 0.5;
            float intensity = abs(1.0 / (p.y * 5.0));
            color += vec3(intensity * 0.1, intensity * 0.5, intensity * 0.8) / i;
        }

        // تفاعل الإضاءة مع الماوس
        float glow = exp(-d * 3.0) * 0.5;
        color += vec3(glow * 0.0, glow * 0.8, glow * 0.9);

        // خلفية داكنة جداً للتباين
        gl_FragColor = vec4(color * 0.8, 1.0);
    }
`;

// إنشاء السطح وتطبيق الشيدر
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

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// دوال تتبع حركة اللمس والماوس
function updateMouse(x, y) {
    targetMouse.x = x / window.innerWidth;
    targetMouse.y = 1.0 - (y / window.innerHeight);
}

window.addEventListener('mousemove', (e) => updateMouse(e.clientX, e.clientY));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: true });

// إعادة تحجيم الشاشة
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// حلقة الرندر (Render Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // حركة ناعمة جداً للماوس (Lerp)
    mouse.x += (targetMouse.x - mouse.x) * 0.1;
    mouse.y += (targetMouse.y - mouse.y) * 0.1;
    
    time += 0.02;
    material.uniforms.uTime.value = time;
    material.uniforms.uMouse.value = mouse;

    renderer.render(scene, camera);
}

// تحريك البطاقات بـ 3D مع الماوس (إضافة تأثير العمق للـ UI)
const cards = document.querySelectorAll('.glass-card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15;
        const rotateY = ((x - centerX) / centerX) * 15;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
});

animate();