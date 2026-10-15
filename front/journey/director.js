import * as THREE from '../faithful/vendor/three.module.js';
import { SPACING, smooth, STORYBOARD } from './chapters.js';
// Every adjacent chapter has a meaningful exit and entrance, in local set coordinates.
// The cut occurs only when a screen, a typographic surface or a monitor fills the view.
function storyboardPoint(index, dz = 0) {
  const [x, y, z] = STORYBOARD[index].position;
  return [x, y, z + dz];
}
const CONNECTIONS = [
  {
    out: [
      [0, 6.55, -24.75],
      [0, 6.55, -26],
    ],
    into: [
      [0, 5, -5.9],
      [0, 5, -8],
    ],
    color: '#e9e7e1',
  },
  {
    out: [
      [0, 5.1, 3.6],
      [0, 5.1, -0.7],
    ],
    into: [
      [0, 4.1, 6.5],
      [0, 4.1, -2],
    ],
    color: '#191c21',
  },
  {
    out: [
      [5.7, 4.1, 4.2],
      [5.7, 4.1, -0.5],
    ],
    into: [storyboardPoint(0, 2), storyboardPoint(0, -1)],
    color: '#deded9',
  },
  {
    out: [storyboardPoint(3, 2), storyboardPoint(3, -1)],
    into: [
      [0.5, 5, -0.4],
      [0.5, 5, -2.2],
    ],
    color: '#deded9',
  },
  {
    out: [
      [4, 5.4, -0.4],
      [4, 5.4, -2],
    ],
    into: [
      [-14, 5.5, 1.8],
      [-14, 5.5, -0.3],
    ],
    color: '#202329',
  },
  {
    out: [
      [-8, 5.2, 1.6],
      [-8, 5.2, -0.2],
    ],
    into: [
      [0, 3.65, -1.5],
      [0, 3.65, -3],
    ],
    color: '#202329',
  },
  {
    out: [
      [0, 3.65, -1.9],
      [0, 3.65, -3],
    ],
    into: [
      [0, 1.95, -18.3],
      [0, 1.75, -16.7],
    ],
    color: '#e9e7e1',
  },
];
function worldPose(pair, index, caseX) {
  const position = new THREE.Vector3(...pair[0]);
  const look = new THREE.Vector3(...pair[1]);
  if (index === 5) {
    position.x += caseX + 14;
    look.x += caseX + 14;
  }
  position.z -= index * SPACING;
  look.z -= index * SPACING;
  return { position, look };
}
function rail(from, to) {
  const middle = from.position.clone().lerp(to.position, 0.55);
  // A restrained dolly, never an orbit around unrelated geometry.
  middle.y += Math.min(0.7, from.position.distanceTo(to.position) * 0.018);
  const path = new THREE.CatmullRomCurve3(
    [from.position, middle, to.position],
    false,
    'centripetal',
  );
  const up = new THREE.Vector3(0, 1, 0);
  const rotation = (pose) =>
    new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(pose.position, pose.look, up),
    );
  return { path, fromRotation: rotation(from), toRotation: rotation(to) };
}
export function createTravel(fromIndex, toIndex, from, to, caseX = -14) {
  const adjacent = Math.abs(fromIndex - toIndex) === 1;
  if (!adjacent)
    return {
      fromIndex,
      toIndex,
      from,
      to,
      duration: 0.85,
      elapsed: 0,
      direct: true,
      color: '#111316',
    };
  const forward = toIndex > fromIndex;
  const edge = CONNECTIONS[Math.min(fromIndex, toIndex)];
  const exit = worldPose(forward ? edge.out : edge.into, fromIndex, caseX);
  const entrance = worldPose(forward ? edge.into : edge.out, toIndex, caseX);
  return {
    fromIndex,
    toIndex,
    from,
    to,
    duration: fromIndex === 0 ? 3.4 : 2.6,
    elapsed: 0,
    direct: false,
    color: edge.color,
    outgoing: rail(from, exit),
    incoming: rail(entrance, to),
  };
}
export function sampleTravel(travel, progress) {
  const second = progress >= 0.5;
  const index = second ? travel.toIndex : travel.fromIndex;
  // A brief, continuous optical occlusion; there is no 100-metre empty corridor.
  const distanceToCut = Math.abs(progress - 0.5);
  const mask = smooth(
    Math.max(0, 1 - distanceToCut / (travel.direct ? 0.5 : 0.085)),
  );
  if (travel.direct)
    return { ...(second ? travel.to : travel.from), index, mask };
  const segment = second ? travel.incoming : travel.outgoing;
  const t = smooth(second ? (progress - 0.5) * 2 : progress * 2);
  const position = segment.path.getPoint(t);
  const rotation = segment.fromRotation.clone().slerp(segment.toRotation, t);
  const look = new THREE.Vector3(0, 0, -10)
    .applyQuaternion(rotation)
    .add(position);
  return { position, look, index, mask };
}
