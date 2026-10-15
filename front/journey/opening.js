import * as THREE from '../faithful/vendor/three.module.js';

/** A short keynote reveal, entirely on the LED surface; no video or texture uploads. */
export function installOpening(kit, screen) {
  const previous = screen.material;
  const uniforms = {
    uGraphic: { value: previous.map },
    uProgress: { value: 0 },
    uDark: { value: new THREE.Color('#13161c') },
  };
  screen.material = kit.own(new THREE.ShaderMaterial({
    uniforms,
    toneMapped: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uGraphic;
      uniform float uProgress;
      uniform vec3 uDark;
      varying vec2 vUv;
      void main() {
        vec3 graphic = texture2D(uGraphic, vUv).rgb;
        // The first line leads; the second follows with a restrained horizontal reveal.
        float delay = mix(0.15, 0.0, smoothstep(0.43, 0.55, vUv.y));
        float reveal = smoothstep(vUv.x * 0.60 + delay,
                                  vUv.x * 0.60 + delay + 0.20, uProgress);
        gl_FragColor = vec4(mix(uDark, graphic, reveal), 1.0);
        #include <colorspace_fragment>
      }
    `,
  }));
  kit.owned.delete(previous);
  previous.dispose();
  return {
    update(seconds, reduced) {
      uniforms.uProgress.value = reduced ? 1 : Math.min(1, Math.max(0, (seconds - 0.25) / 2.2));
    },
  };
}
