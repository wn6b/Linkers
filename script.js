// إنشاء مشهد 3D واقعي
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// إضافة إضاءة واقعية
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// إضافة جزيئات تسبح (Stars/Dust) لتعطي عمق
function addStar() {
    const geometry = new THREE.SphereGeometry(0.1, 24, 24);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const star = new THREE.Mesh(geometry, material);

    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    scene.add(star);
}
Array(200).fill().map(addStar);

// تحريك الكاميرا مع الماوس
document.body.onscroll = () => {
    const t = document.body.getBoundingClientRect().top;
    camera.position.z = t * -0.01 + 30;
    camera.position.y = t * -0.002;
    camera.rotation.y = t * -0.0002;
};

function animate() {
    requestAnimationFrame(animate);
    scene.rotation.x += 0.001;
    scene.rotation.y += 0.001;
    renderer.render(scene, camera);
}

// إخفاء شاشة التحميل
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 1000);
    }, 1500);
});

animate();

// استجابة لتغير حجم الشاشة
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});