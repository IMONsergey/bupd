import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const softened = new WeakMap();
const v = new THREE.Vector3(),
  q = new THREE.Quaternion();
const findBone = (root, name) => {
  let found;
  root.traverse((o) => {
    if (
      o.isBone &&
      o.name.replace(/[^a-z]/gi, '') === name.replace(/[^a-z]/gi, '')
    )
      found = o;
  });
  return found;
};
function aim(root, name, direction) {
  const bone = findBone(root, name),
    child = bone?.children.find((o) => o.isBone);
  if (!child) return;
  root.updateMatrixWorld(true);
  const start = bone.getWorldPosition(new THREE.Vector3());
  const current = child
    .getWorldPosition(new THREE.Vector3())
    .sub(start)
    .normalize();
  const delta = new THREE.Quaternion().setFromUnitVectors(
    current,
    new THREE.Vector3(...direction).normalize(),
  );
  const world = bone
    .getWorldQuaternion(new THREE.Quaternion())
    .premultiply(delta);
  bone.quaternion.copy(
    bone.parent
      .getWorldQuaternion(new THREE.Quaternion())
      .invert()
      .multiply(world),
  );
  root.updateMatrixWorld(true);
}
function placeBone(root, name, point) {
  const bone = findBone(root, name);
  if (!bone) return;
  bone.position.copy(bone.parent.worldToLocal(new THREE.Vector3(...point)));
  root.updateMatrixWorld(true);
}
function character(asset, height = 1.78, offset = 0) {
  const group = new THREE.Group(),
    rig = clone(asset.scene);
  rig.traverse((o) => {
    if (o.isMesh) {
      let g = softened.get(o.geometry);
      if (!g) {
        g = o.geometry.clone();
        for (const [key, a] of Object.entries(g.attributes)) {
          const values = new Float32Array(a.count * a.itemSize);
          const getters = ['getX', 'getY', 'getZ', 'getW'];
          for (let i = 0; i < a.count; i++)
            for (let j = 0; j < a.itemSize; j++)
              values[i * a.itemSize + j] = a[getters[j]](i);
          g.setAttribute(key, new THREE.BufferAttribute(values, a.itemSize));
        }
        g.deleteAttribute('normal');
        g = mergeVertices(g, 1e-5);
        g.computeVertexNormals();
        softened.set(o.geometry, g);
      }
      o.geometry = g;
    }
  });
  const mixer = new THREE.AnimationMixer(rig);
  const idle =
    asset.animations.find((c) => c.name === 'Idle_Neutral') ||
    asset.animations[0];
  mixer.clipAction(idle).play();
  mixer.setTime(offset);
  rig.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(rig, true);
  const scale = height / (box.max.y - box.min.y);
  rig.scale.multiplyScalar(scale);
  rig.position.y -= box.min.y * scale;
  group.add(rig);
  group.updateMatrixWorld(true);
  return { group, rig, mixer, height, idle };
}
function seatPerson(person, variant) {
  const root = person.group;
  const body = findBone(root, 'Body');
  if (!body) throw new Error('Character rig is missing its pelvis control.');
  const hip = body.getWorldPosition(new THREE.Vector3());
  placeBone(root, 'Body', [hip.x, 0.81, -0.02]);
  for (const side of ['L', 'R']) {
    const sign = side === 'L' ? 1 : -1;
    aim(root, `UpperLeg.${side}`, [sign * 0.06, -0.08, 1]);
    aim(root, `LowerLeg.${side}`, [sign * 0.03, -1, 0.03]);
    placeBone(root, `Foot.${side}`, [sign * 0.12, 0.08, 0.49]);
    aim(root, `UpperArm.${side}`, [sign * 0.06, -0.87, 0.5]);
    aim(root, `LowerArm.${side}`, [sign * -0.03, -0.08, 1]);
  }
  const head = findBone(root, 'Head');
  if (head) {
    head.rotation.y += (variant - 1) * 0.06;
    head.scale.multiplyScalar(0.83);
  }
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (o.isSkinnedMesh) o.skeleton.update();
  });
}
/** Skin each template once on the CPU; 120 audience members use four instanced draws. */
function bake(person) {
  const positions = [],
    colors = [],
    indices = [];
  person.group.updateMatrixWorld(true);
  person.group.traverse((mesh) => {
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material))
      throw new Error('Unexpected multi-material primitive.');
    const pos = mesh.geometry.attributes.position,
      base = positions.length / 3;
    const color = mesh.material.color;
    for (let i = 0; i < pos.count; i++) {
      mesh.getVertexPosition(i, v).applyMatrix4(mesh.matrixWorld);
      positions.push(v.x, v.y, v.z);
      colors.push(color.r, color.g, color.b);
    }
    const ix = mesh.geometry.index;
    if (ix) for (let i = 0; i < ix.count; i++) indices.push(base + ix.getX(i));
    else for (let i = 0; i < pos.count; i++) indices.push(base + i);
  });
  let geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry = mergeVertices(geometry, 1e-5);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  person.mixer.stopAllAction();
  return geometry;
}
export function createPeople(assets, seatedAsset = null) {
  const group = new THREE.Group();
  group.name = 'Living audience';
  const motion = { value: 0 },
    time = { value: 0 };
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.84,
    metalness: 0,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms.crowdTime = time;
    shader.uniforms.crowdMotion = motion;
    shader.vertexShader =
      'uniform float crowdTime; uniform float crowdMotion;\n' +
      shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat phase = instanceMatrix[3].x*1.91 + instanceMatrix[3].z*2.11;\nfloat head = smoothstep(1.08,1.37,position.y);\ntransformed.x += sin(crowdTime*.43+phase)*.012*head*crowdMotion;\ntransformed.z += sin(crowdTime*.31+phase)*.008*head*crowdMotion;\n#endif',
    );
  };
  let count = 0;
  if (seatedAsset) {
    seatedAsset.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = material;
        o.receiveShadow = true;
        o.castShadow = false;
        if (o.isInstancedMesh) {
          count += o.count;
          for (let n = 0; n < o.count; n++)
            o.setColorAt(
              n,
              new THREE.Color().setScalar(0.75 + ((n * 7) % 11) * 0.021),
            );
        }
      }
    });
    group.add(seatedAsset.scene);
  } else {
    const poses = [];
    for (let n = 0; n < 4; n++) {
      const person = character(assets[n % 2], n % 2 ? 1.69 : 1.8, 0.4);
      seatPerson(person, n);
      poses.push(bake(person));
    }
    const seats = [[], [], [], []];
    for (let row = 0; row < 11; row++)
      for (const side of [-1, 1])
        for (let col = 0; col < 8; col++) {
          // Intentional gaps and staggered clothing; not a mechanically full stadium.
          const hash = (row * 37 + col * 17 + (side + 1) * 9) % 13;
          if (hash < 3 || (col === 0 && row === 9)) continue;
          seats[(row + col + (side > 0 ? 1 : 0)) % 4].push({
            x: side * (2 + col * 1.13),
            z: -5.2 + row * 1.8,
            scale: 0.97 + (hash % 4) * 0.018,
          });
        }
    const dummy = new THREE.Object3D();
    poses.forEach((geometry, i) => {
      const batch = new THREE.InstancedMesh(
        geometry,
        material,
        seats[i].length,
      );
      batch.name = `Audience batch ${i}`;
      seats[i].forEach((p, j) => {
        dummy.position.set(p.x, 0, p.z);
        dummy.rotation.set(0, Math.PI, 0);
        dummy.scale.set(p.scale, p.scale, p.scale);
        dummy.updateMatrix();
        batch.setMatrixAt(j, dummy.matrix);
        batch.setColorAt(
          j,
          new THREE.Color().setScalar(0.65 + ((j * 7) % 11) * 0.027),
        );
      });
      batch.instanceMatrix.needsUpdate = true;
      batch.castShadow = false;
      batch.receiveShadow = true;
      batch.computeBoundingSphere();
      group.add(batch);
      count += seats[i].length;
    });
  }
  const actors = [];
  function actor(
    assetIndex,
    position,
    angle,
    height,
    clipName = 'Idle_Neutral',
  ) {
    const a = character(assets[assetIndex], height, 0);
    a.mixer.stopAllAction();
    a.idleAction = a.mixer
      .clipAction(
        assets[assetIndex].animations.find((c) => c.name === clipName) ||
          a.idle,
      )
      .play();
    a.group.position.set(...position);
    a.group.rotation.y = angle;
    a.group.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false;
        o.receiveShadow = true;
      }
    });
    a.head = findBone(a.group, 'Head');
    a.headScale = a.head?.scale.clone();
    a.base = new THREE.Vector3(...position);
    group.add(a.group);
    actors.push(a);
    return a;
  }
  const guide = actor(1, [-1.3, 0, 8.0], 2.4, 1.73, 'Idle');
  const guest = actor(0, [-0.75, 0, 6.4], Math.PI, 1.85, 'Idle_Neutral');
  guest.stand = guest.idleAction;
  guest.walk = guest.mixer.clipAction(
    assets[0].animations.find((c) => c.name === 'Walk'),
  );
  let guestMode = 'idle';
  const speaker = actor(0, [5.0, 1.0, -12.4], -Math.PI / 2, 1.83, 'Walk');
  speaker.walk = speaker.idleAction;
  speaker.talk = speaker.mixer.clipAction(
    assets[0].animations.find((c) => c.name === 'Interact'),
  );
  speaker.stand = speaker.mixer.clipAction(
    assets[0].animations.find((c) => c.name === 'Idle_Neutral'),
  );
  actor(1, [12.4, 0, 4.2], -1.3, 1.69, 'Idle');
  actor(0, [13.4, 0, 3.7], 1.9, 1.78, 'Idle_Neutral');
  // A small real badge on the guide; no fake people represented by floating labels.
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.085, 0.115),
    new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.8 }),
  );
  badge.position.set(0, 1.18, 0.18);
  guide.group.add(badge);
  let actorMode = 'walk';
  return {
    group,
    count: count + actors.length,
    seated: count,
    animated: actors.length,
    update(progress, seconds, reduced) {
      motion.value = reduced ? 0 : 1;
      time.value = seconds;
      const settle = THREE.MathUtils.smoothstep(progress, 0, 0.19);
      guide.group.rotation.y = 2.4 + settle * 0.4;
      guest.group.position.set(
        -0.75 - THREE.MathUtils.smoothstep(progress, 0.16, 0.22) * 2.35,
        0,
        6.4 - THREE.MathUtils.smoothstep(progress, 0, 0.22) * 13.5,
      );
      guest.group.rotation.y =
        Math.PI + THREE.MathUtils.smoothstep(progress, 0.16, 0.22) * 0.49;
      const gmode = progress > 0.005 && progress < 0.22 ? 'walk' : 'idle';
      if (gmode !== guestMode) {
        guest.mixer.stopAllAction();
        (gmode === 'walk' ? guest.walk : guest.stand).play();
        guestMode = gmode;
      }
      speaker.group.visible = progress < 0.92;
      const enter = THREE.MathUtils.smoothstep(progress, 0.05, 0.245);
      speaker.group.position.set(5.0 - enter * 5, 1, -12.4);
      speaker.group.rotation.y = THREE.MathUtils.lerp(
        -Math.PI / 2,
        0,
        THREE.MathUtils.smoothstep(progress, 0.19, 0.245),
      );
      const mode = progress > 0.055 && progress < 0.225 ? 'walk' : 'talk';
      if (mode !== actorMode) {
        speaker.mixer.stopAllAction();
        (mode === 'walk' ? speaker.walk : speaker.stand).play();
        actorMode = mode;
      }
      for (let i = 0; i < actors.length; i++) {
        const a = actors[i];
        const walking =
          (a === guest && gmode === 'walk') ||
          (a === speaker && mode === 'walk');
        a.mixer.setTime(
          walking ? progress * 31 : (reduced ? 1.2 : seconds * 0.72) + i * 0.51,
        );
        if (a.head) a.head.scale.copy(a.headScale).multiplyScalar(0.83);
      }
      // Controlled address gesture, not a looping game emote.
      if (progress >= 0.225) {
        aim(speaker.group, 'UpperArm.R', [-0.4, -0.7, 0.55]);
        aim(speaker.group, 'LowerArm.R', [-0.2, 0.22, 1]);
      }
    },
  };
}
