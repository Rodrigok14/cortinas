"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAG = `
uniform float uTime;
uniform vec2 uResolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  float wave = sin(uv.x * 6.28318 + uTime * 0.35) * 0.5 + 0.5;
  float wave2 = sin(uv.y * 4.71239 - uTime * 0.28) * 0.5 + 0.5;
  float mist = smoothstep(0.2, 0.9, wave * wave2);
  vec3 deep = vec3(0.02, 0.06, 0.04);
  vec3 glow = vec3(0.12, 0.32, 0.22);
  vec3 col = mix(deep, glow, mist * 0.55);
  float vignette = smoothstep(1.15, 0.35, length(uv - 0.5));
  col *= vignette;
  gl_FragColor = vec4(col, 0.42);
}
`;

type Props = {
  className?: string;
};

export function AmbientWebGLBackdrop({ className = "" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      mat.uniforms.uResolution.value.set(w, h);
    };

    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let frame: number;
    const t0 = performance.now();
    const loop = (t: number) => {
      mat.uniforms.uTime.value = (t - t0) * 0.001;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      mount.removeChild(renderer.domElement);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none absolute inset-0 z-[1] ${className}`}
      aria-hidden
    />
  );
}
