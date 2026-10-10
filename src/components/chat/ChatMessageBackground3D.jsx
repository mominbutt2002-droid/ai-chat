import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function readIsDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/** Разноцветная палитра: красный → оранж → жёлтый → зелёный → cyan → синий → фиолет → розовый */
const RAINBOW_HEX = [
  0xff3366,
  0xff8c00,
  0xffe066,
  0x39ff14,
  0x00f5ff,
  0x4d7cff,
  0xa855f7,
  0xff47da,
];

function createGlowMaterial(colorHex, dark) {
  return new THREE.MeshPhysicalMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: dark ? 0.58 : 0.48,
    metalness: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: dark ? 0.84 : 0.76,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
  });
}

export function ChatMessageBackground3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const dark = readIsDark();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));

    const coloredLights = [
      { color: 0xff3366, intensity: 1.8, pos: [3, 4, 5] },
      { color: 0xffe066, intensity: 1.5, pos: [-4, 3, 4] },
      { color: 0x39ff14, intensity: 1.4, pos: [2, -3, 3] },
      { color: 0x00f5ff, intensity: 1.9, pos: [-2, -2, 5] },
      { color: 0xa855f7, intensity: 1.6, pos: [0, 5, 2] },
    ];
    const pointLights = coloredLights.map((cfg) => {
      const light = new THREE.PointLight(cfg.color, cfg.intensity, 20);
      light.position.set(...cfg.pos);
      scene.add(light);
      return light;
    });

    const mainShapes = [
      { geometry: new THREE.IcosahedronGeometry(0.82, 1), colorIndex: 0 },
      { geometry: new THREE.TorusKnotGeometry(0.52, 0.15, 96, 12), colorIndex: 2 },
      { geometry: new THREE.OctahedronGeometry(0.72, 0), colorIndex: 4 },
      { geometry: new THREE.TorusGeometry(0.62, 0.18, 20, 36), colorIndex: 6 },
      { geometry: new THREE.DodecahedronGeometry(0.58, 0), colorIndex: 1 },
      { geometry: new THREE.TetrahedronGeometry(0.78, 0), colorIndex: 5 },
    ];

    const meshes = [];

    mainShapes.forEach((shape, index) => {
      const color = RAINBOW_HEX[shape.colorIndex % RAINBOW_HEX.length];
      const material = createGlowMaterial(color, dark);
      const mesh = new THREE.Mesh(shape.geometry, material);
      const angle = (index / mainShapes.length) * Math.PI * 2;
      mesh.userData = {
        base: {
          x: Math.cos(angle) * 2,
          y: Math.sin(angle) * 1.15,
          z: -index * 0.38,
          spin: 0.2 + index * 0.05,
        },
        hueSeed: shape.colorIndex / RAINBOW_HEX.length,
        colorIndex: shape.colorIndex,
      };
      mesh.position.set(mesh.userData.base.x, mesh.userData.base.y, mesh.userData.base.z);
      scene.add(mesh);
      meshes.push(mesh);

      const wireColor = RAINBOW_HEX[(shape.colorIndex + 3) % RAINBOW_HEX.length];
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(shape.geometry),
        new THREE.LineBasicMaterial({
          color: wireColor,
          transparent: true,
          opacity: dark ? 0.45 : 0.35,
        }),
      );
      wire.position.copy(mesh.position);
      wire.userData.follow = mesh;
      scene.add(wire);
      meshes.push(wire);
    });

    const sparkles = new THREE.Group();
    const sparkleGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const sparkleMeshes = [];
    for (let i = 0; i < 18; i++) {
      const color = RAINBOW_HEX[i % RAINBOW_HEX.length];
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
      });
      const dot = new THREE.Mesh(sparkleGeo, mat);
      const a = (i / 18) * Math.PI * 2;
      dot.userData = {
        orbitR: 2.4 + (i % 3) * 0.35,
        orbitZ: -1.2 - (i % 4) * 0.25,
        speed: 0.35 + (i % 5) * 0.08,
        phase: a,
      };
      sparkles.add(dot);
      sparkleMeshes.push(dot);
    }
    scene.add(sparkles);

    const applyTheme = () => {
      const isDark = readIsDark();
      const opacity = isDark ? 0.84 : 0.76;
      const emissiveIntensity = isDark ? 0.58 : 0.48;
      meshes.forEach((obj) => {
        if (obj.material?.emissiveIntensity !== undefined) {
          obj.material.opacity = opacity;
          obj.material.emissiveIntensity = emissiveIntensity;
        }
        if (obj.material?.type === 'LineBasicMaterial') {
          obj.material.opacity = isDark ? 0.45 : 0.35;
        }
      });
    };

    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const clock = new THREE.Clock();
    let frameId = 0;
    const tempColor = new THREE.Color();

    const animate = () => {
      const t = clock.getElapsedTime();

      pointLights.forEach((light, i) => {
        const cfg = coloredLights[i];
        light.position.x = cfg.pos[0] + Math.sin(t * 0.4 + i * 1.2) * 1.2;
        light.position.y = cfg.pos[1] + Math.cos(t * 0.35 + i) * 1;
      });

      meshes.forEach((obj) => {
        if (!obj.userData.base) return;
        const base = obj.userData.base;
        const index = obj.userData.colorIndex ?? 0;
        const pulse = 1 + Math.sin(t * 1.1 + index * 1.4) * 0.07;
        obj.scale.setScalar(pulse);
        obj.rotation.x = t * base.spin + index;
        obj.rotation.y = t * (base.spin + 0.1);
        obj.position.y = base.y + Math.sin(t * 0.65 + index * 1.2) * 0.48;
        obj.position.x = base.x + Math.cos(t * 0.42 + index) * 0.32;

        if (obj.material?.emissive) {
          const hue = (obj.userData.hueSeed + t * 0.04) % 1;
          tempColor.setHSL(hue, 0.92, 0.55);
          obj.material.color.copy(tempColor);
          obj.material.emissive.copy(tempColor);
        }
      });

      meshes.forEach((obj) => {
        if (obj.userData.follow) {
          obj.position.copy(obj.userData.follow.position);
          obj.rotation.copy(obj.userData.follow.rotation);
          obj.scale.copy(obj.userData.follow.scale);
        }
      });

      sparkleMeshes.forEach((dot) => {
        const u = dot.userData;
        const a = u.phase + t * u.speed;
        dot.position.x = Math.cos(a) * u.orbitR;
        dot.position.y = Math.sin(a * 1.3) * (u.orbitR * 0.55);
        dot.position.z = u.orbitZ + Math.sin(t + u.phase) * 0.35;
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      const disposedGeometries = new Set();
      meshes.forEach((obj) => {
        if (obj.geometry && !disposedGeometries.has(obj.geometry)) {
          disposedGeometries.add(obj.geometry);
          obj.geometry.dispose();
        }
        obj.material?.dispose();
      });
      sparkleMeshes.forEach((dot) => dot.material.dispose());
      sparkleGeo.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="message-list__bg3d" ref={mountRef} aria-hidden="true">
      <div className="message-list__bg3d-vignette" />
    </div>
  );
}
