import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  particleCount?: number;
  maxDistance?: number;
  color?: string;
}

export function ParticleNetworkBg({
  particleCount = 90,
  maxDistance = 8,
  color = "#2563eb",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Particles ---
    const positions = new Float32Array(particleCount * 3);
    const velocities: THREE.Vector3[] = [];
    const spread = 16;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        )
      );
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color,
      size: 0.18,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(points);

    // --- Connecting lines (rebuilt every frame based on proximity) ---
    const lineMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
    });
    const maxLineVertices = particleCount * particleCount * 2 * 3;
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(maxLineVertices);
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // --- Mouse parallax ---
    const mouse = { x: 0, y: 0 };
    function onMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    window.addEventListener("mousemove", onMouseMove);

    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);

      const posAttr = particleGeometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        posAttr.array[i * 3] += velocities[i].x;
        posAttr.array[i * 3 + 1] += velocities[i].y;
        posAttr.array[i * 3 + 2] += velocities[i].z;

        for (const axis of [0, 1, 2]) {
          const val = posAttr.array[i * 3 + axis];
          if (val > spread || val < -spread) {
            velocities[i].setComponent(axis, velocities[i].getComponent(axis) * -1);
          }
        }
      }
      posAttr.needsUpdate = true;

      // Rebuild connecting lines based on current distances
      let vertexIndex = 0;
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posAttr.array[i * 3] - posAttr.array[j * 3];
          const dy = posAttr.array[i * 3 + 1] - posAttr.array[j * 3 + 1];
          const dz = posAttr.array[i * 3 + 2] - posAttr.array[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance) {
            linePositions[vertexIndex++] = posAttr.array[i * 3];
            linePositions[vertexIndex++] = posAttr.array[i * 3 + 1];
            linePositions[vertexIndex++] = posAttr.array[i * 3 + 2];
            linePositions[vertexIndex++] = posAttr.array[j * 3];
            linePositions[vertexIndex++] = posAttr.array[j * 3 + 1];
            linePositions[vertexIndex++] = posAttr.array[j * 3 + 2];
          }
        }
      }
      lineGeometry.setDrawRange(0, vertexIndex / 3);
      (lineGeometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

      // Gentle camera parallax + auto-rotate
      camera.position.x += (mouse.x * 3 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      scene.rotation.y += 0.0008;

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container!.clientWidth;
      const h = container!.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      particleGeometry.dispose();
      particleMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      container!.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleCount, maxDistance, color]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
}