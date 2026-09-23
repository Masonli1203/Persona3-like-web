const EPSILON = 1e-7;
export const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const subtract = (a, b) => a.map((value, i) => value - b[i]);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function planeOf(points) {
  for (let i = 1; i < points.length - 1; i++) {
    const normal = cross(subtract(points[i], points[0]), subtract(points[i + 1], points[0]));
    const length = Math.hypot(...normal);
    if (length > EPSILON) {
      const unit = normal.map((value) => value / length);
      return { normal: unit, distance: dot(unit, points[0]) };
    }
  }
  return null;
}

// Centre-depth sorting cannot order a long floor or post against everything it
// overlaps. Split intersecting polygons at their planes, then traverse a BSP
// from far to near. This runs only while generating the static asset.
export function painterOrder(polygons, viewDirection) {
  if (!polygons.length) return [];
  const divider = polygons.reduce((largest, polygon) =>
    polygon.area > largest.area ? polygon : largest,
  );
  const { normal, distance } = divider.plane;
  const front = [],
    back = [],
    coplanar = [];
  for (const polygon of polygons) {
    const distances = polygon.points.map((point) => dot(normal, point) - distance);
    const hasFront = distances.some((value) => value > EPSILON);
    const hasBack = distances.some((value) => value < -EPSILON);
    if (!hasFront && !hasBack) coplanar.push(polygon);
    else if (!hasBack) front.push(polygon);
    else if (!hasFront) back.push(polygon);
    else {
      const frontPoints = [],
        backPoints = [];
      polygon.points.forEach((point, index) => {
        const next = polygon.points[(index + 1) % polygon.points.length];
        const here = distances[index],
          there = distances[(index + 1) % distances.length];
        if (here >= -EPSILON) frontPoints.push(point);
        if (here <= EPSILON) backPoints.push(point);
        if ((here > EPSILON && there < -EPSILON) || (here < -EPSILON && there > EPSILON)) {
          const ratio = here / (here - there);
          const intersection = point.map((value, i) => value + ratio * (next[i] - value));
          frontPoints.push(intersection);
          backPoints.push(intersection);
        }
      });
      if (planeOf(frontPoints)) front.push({ ...polygon, points: frontPoints });
      if (planeOf(backPoints)) back.push({ ...polygon, points: backPoints });
    }
  }
  const [far, near] = dot(normal, viewDirection) >= 0 ? [back, front] : [front, back];
  return [...painterOrder(far, viewDirection), ...coplanar, ...painterOrder(near, viewDirection)];
}
