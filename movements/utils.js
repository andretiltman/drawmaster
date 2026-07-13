/* Shared helpers for movement modules that react to other creatures. */

export function distance(a, b){
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

/* Nearest other creature of a given type, or null if none exist. */
export function findNearestOfType(self, type, creatures){
  let target = null, best = Infinity;
  for(const other of creatures){
    if(other === self || other.type !== type) continue;
    const d = distance(self, other);
    if(d < best){ best = d; target = other; }
  }
  return target ? { target, distance: best } : null;
}
