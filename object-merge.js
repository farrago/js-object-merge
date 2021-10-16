/**
 * threeWayMerge function based almost entirely on
 * https://github.com/rsms/js-object-merge but with some changes to fix
 * the diffs of nested objects (and not add to the global Object)
 *
 * @param {*} o - The original (base) object
 * @param {*} a - One side of the merge
 * @param {*} b - The other side of the merge. If there are conflicts, b wins.
 * @param {*} objOrShallow
 * @returns
 */
function threeWayMerge(o, a, b, objOrShallow) {
  var r,
    k,
    v,
    ov,
    bv,
    inR,
    isArray = Array.isArray(a),
    hasConflicts,
    conflicts = {},
    newInA = {},
    newInB = {},
    updatedInA = {},
    updatedInB = {},
    keyUnion = {},
    deep = true;

  if (typeof objOrShallow !== "object") {
    r = isArray ? [] : {};
    deep = !objOrShallow;
  } else {
    r = objOrShallow;
  }

  for (k in b) {
    if (isArray && isNaN((k = parseInt(k)))) continue;
    v = b[k];
    r[k] = v;
    if (!(k in o)) {
      newInB[k] = v;
    } else if (v !== o[k]) {
      updatedInB[k] = v;
    }
  }

  for (k in a) {
    let deeplyCompared = false;
    if (isArray && isNaN((k = parseInt(k)))) continue;
    v = a[k];
    ov = o[k];
    inR = k in r;
    if (!inR) {
      r[k] = v;
    } else if (r[k] !== v) {
      bv = b[k];
      if (deep && typeof v === "object" && typeof bv === "object") {
        deeplyCompared = true;
        bv = threeWayMerge(k in o && typeof ov === "object" ? ov : {}, v, bv);
        r[k] = bv.merged;
        if (bv.conflicts) {
          conflicts[k] = { conflicts: bv.conflicts };
          hasConflicts = true;
        }
        if (Object.keys(bv.added.a).length > 0) {
          newInA[k] = bv.added.a;
          if (Array.isArray(v) && typeof newInA[k] === "object") {
            newInA[k]._t = "Array";
          }
        }
        if (Object.keys(bv.added.b).length > 0) {
          newInB[k] = bv.added.b;
          if (Array.isArray(v) && typeof newInB[k] === "object") {
            newInB[k]._t = "Array";
          }
        }
        if (Object.keys(bv.updated.a).length > 0) {
          updatedInA[k] = bv.updated.a;
          if (Array.isArray(v) && typeof updatedInA[k] === "object") {
            updatedInA[k]._t = "Array";
          }
        }
        if (Object.keys(bv.updated.b).length > 0) {
          updatedInB = bv.updated.b;
          if (Array.isArray(v) && typeof updatedInB[k] === "object") {
            updatedInB[k]._t = "Array";
          }
        }
      } else {
        // if
        if (bv === ov) {
          // Pick A as B has not changed from O
          r[k] = v;
        } else if (v !== ov) {
          // A, O and B are different
          if (k in o) conflicts[k] = { a: v, o: ov, b: bv };
          else conflicts[k] = { a: v, b: bv };
          hasConflicts = true;
        } // else Pick B (already done) as A has not changed from O
      }
    }

    if (k in o) {
      if (!deeplyCompared && v !== ov) updatedInA[k] = v;
    } else {
      newInA[k] = v;
    }
  }

  r = {
    merged: r,
    added: {
      a: newInA,
      b: newInB,
    },
    updated: {
      a: updatedInA,
      b: updatedInB,
    },
  };
  if (hasConflicts) r.conflicts = conflicts;
  return r;
}

module.exports = threeWayMerge;
