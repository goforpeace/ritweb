"use client";
import React, { useRef, useEffect } from 'react';
import { Renderer, Camera, Transform, Mesh, Box, Program } from 'ogl';

const vertex = `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  precision highp float;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
    vec3 color = vec3(0.0, 1.0, 1.0); // Cyan
    gl_FragColor.rgb = color + lighting * 0.2;
    gl_FragColor.a = lighting * 0.5 + 0.1;
  }
`;

const Prism: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new Renderer({ canvas: canvasRef.current, alpha: true, antialias: true, dpr: 2 });
    const gl = renderer.gl;

    const resize = () => {
      const parent = canvasRef.current?.parentElement;
      if(parent) {
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      }
    };
    
    const camera = new Camera(gl, { fov: 45 });
    camera.position.set(0, 0, 4);

    window.addEventListener('resize', resize, false);
    resize();

    const scene = new Transform();
    const geometry = new Box(gl, { width: 1.8, height: 1.8, depth: 1.8 });

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let animationFrameId: number;
    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);
      mesh.rotation.y -= 0.003;
      mesh.rotation.x += 0.004;
      renderer.render({ scene, camera });
    };

    update(0);

    return () => {
      window.removeEventListener('resize', resize, false);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default Prism;
