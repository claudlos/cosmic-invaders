import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ─── Player Ship ─────────────────────────────────────────────────────────────
// Sleek arrow/triangle with cyan emissive glow

export function createPlayerShip() {
  const group = new THREE.Group();

  // Main hull — custom arrow shape
  const hullShape = new THREE.Shape();
  hullShape.moveTo(0, 18);       // nose
  hullShape.lineTo(-5, 8);       // left shoulder
  hullShape.lineTo(-14, -10);    // left wingtip
  hullShape.lineTo(-10, -6);     // left wing inner
  hullShape.lineTo(-4, -4);      // left body
  hullShape.lineTo(0, -8);       // tail center
  hullShape.lineTo(4, -4);       // right body
  hullShape.lineTo(10, -6);      // right wing inner
  hullShape.lineTo(14, -10);     // right wingtip
  hullShape.lineTo(5, 8);        // right shoulder
  hullShape.closePath();

  const hullGeo = new THREE.ShapeGeometry(hullShape);
  const hullMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    toneMapped: false,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  group.add(hull);

  // Cockpit
  const cockpitGeo = new THREE.CircleGeometry(3, 8);
  const cockpitMat = new THREE.MeshBasicMaterial({
    color: 0xaaffee,
    toneMapped: false,
  });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(0, 5, 0.1);
  group.add(cockpit);

  // Engine glow
  const engineGeo = new THREE.CircleGeometry(2, 6);
  const engineMat = new THREE.MeshBasicMaterial({
    color: 0x00aaff,
    toneMapped: false,
  });
  const engineL = new THREE.Mesh(engineGeo, engineMat);
  engineL.position.set(-4, -6, 0.1);
  group.add(engineL);
  const engineR = engineL.clone();
  engineR.position.set(4, -6, 0.1);
  group.add(engineR);

  return group;
}

// ─── Invaders ────────────────────────────────────────────────────────────────
// Different shapes per type using merged box geometries

export function createInvader(type = 'basic') {
  const group = new THREE.Group();
  let color;
  let boxes;

  switch (type) {
    case 'elite':
      color = 0xff4488;
      boxes = buildOctopus();
      break;
    case 'tough':
      color = 0xffaa22;
      boxes = buildCrab();
      break;
    case 'basic':
    default:
      color = 0x88ff44;
      boxes = buildSquid();
      break;
  }

  if (boxes.length > 0) {
    const merged = mergeGeometries(boxes);
    const mat = new THREE.MeshBasicMaterial({
      color,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(merged, mat);
    group.add(mesh);

    // Clean up source geos
    for (const g of boxes) g.dispose();
  }

  return group;
}

function box(w, h, x, y) {
  const geo = new THREE.BoxGeometry(w, h, 1);
  geo.translate(x, y, 0);
  return geo;
}

function buildSquid() {
  // Squid-like shape: narrow body + dangling tentacles
  return [
    box(8, 4, 0, 4),    // head
    box(12, 3, 0, 1),   // body
    box(4, 2, 0, -2),   // center
    box(2, 4, -5, -2),  // left tentacle
    box(2, 4, 5, -2),   // right tentacle
    box(2, 3, -3, -3),  // inner left
    box(2, 3, 3, -3),   // inner right
  ];
}

function buildCrab() {
  // Crab-like: wider body + pincers
  return [
    box(10, 4, 0, 3),   // head
    box(16, 3, 0, 0),   // wide body
    box(4, 2, 0, -2),   // center
    box(3, 5, -8, 1),   // left pincer
    box(3, 5, 8, 1),    // right pincer
    box(2, 3, -4, -3),  // left leg
    box(2, 3, 4, -3),   // right leg
    box(2, 2, -6, -3),  // outer left leg
    box(2, 2, 6, -3),   // outer right leg
  ];
}

function buildOctopus() {
  // Octopus-like: round body + many tentacles
  return [
    box(12, 5, 0, 4),   // dome
    box(8, 3, 0, 1),    // body
    box(14, 2, 0, -1),  // skirt
    box(2, 4, -6, -4),  // tentacles
    box(2, 4, -3, -4),
    box(2, 4, 0, -4),
    box(2, 4, 3, -4),
    box(2, 4, 6, -4),
    // eyes
    box(2, 2, -3, 4),
    box(2, 2, 3, 4),
  ];
}

// ─── Bullet ──────────────────────────────────────────────────────────────────

export function createBullet(isPlayer = true) {
  const group = new THREE.Group();

  const geo = new THREE.CylinderGeometry(1.5, 1.5, 8, 6);
  geo.rotateX(Math.PI / 2); // point along Y-axis in 2D view
  const color = isPlayer ? 0x00ffff : 0xff4444;
  const mat = new THREE.MeshBasicMaterial({
    color,
    toneMapped: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Glow halo
  const glowGeo = new THREE.CircleGeometry(3, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.z = -0.1;
  group.add(glow);

  return group;
}

// ─── Barrier Block ───────────────────────────────────────────────────────────

export function createBarrierBlock() {
  const geo = new THREE.BoxGeometry(8, 8, 4);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    toneMapped: false,
  });
  return new THREE.Mesh(geo, mat);
}

// ─── Power-Up ────────────────────────────────────────────────────────────────
// Spinning diamond shape, color varies by type

const POWERUP_COLORS = {
  speed: 0xffff00,
  multishot: 0xff4444,
  shield: 0x4488ff,
};

export function createPowerUp(type = 'speed') {
  const group = new THREE.Group();

  // Diamond = two triangles mirrored
  const shape = new THREE.Shape();
  shape.moveTo(0, 10);
  shape.lineTo(7, 0);
  shape.lineTo(0, -10);
  shape.lineTo(-7, 0);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  const color = POWERUP_COLORS[type] || 0xffffff;
  const mat = new THREE.MeshBasicMaterial({
    color,
    toneMapped: false,
  });
  const diamond = new THREE.Mesh(geo, mat);
  group.add(diamond);

  // Inner glow accent
  const innerShape = new THREE.Shape();
  innerShape.moveTo(0, 6);
  innerShape.lineTo(4, 0);
  innerShape.lineTo(0, -6);
  innerShape.lineTo(-4, 0);
  innerShape.closePath();

  const innerGeo = new THREE.ShapeGeometry(innerShape);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.z = 0.1;
  group.add(inner);

  // Store type for game logic
  group.userData.powerUpType = type;

  return group;
}
