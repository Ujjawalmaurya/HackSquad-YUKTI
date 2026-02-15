const ndarray = require('ndarray');

// Pure functions for vegetation indices

// NDVI = (NIR - Red) / (NIR + Red)
function ndvi(nir, red) {
    if (nir.length !== red.length) throw new Error("Bands length mismatch");
    const result = new Float32Array(nir.length);
    for (let i = 0; i < nir.length; i++) {
        const n = nir[i];
        const r = red[i];
        if (n + r === 0) result[i] = 0;
        else result[i] = (n - r) / (n + r);
    }
    return result;
}

// GNDVI = (NIR - Green) / (NIR + Green)
function gndvi(nir, green) {
    if (nir.length !== green.length) throw new Error("Bands length mismatch");
    const result = new Float32Array(nir.length);
    for (let i = 0; i < nir.length; i++) {
        const n = nir[i];
        const g = green[i];
        if (n + g === 0) result[i] = 0;
        else result[i] = (n - g) / (n + g);
    }
    return result;
}

// NDRE = (NIR - RedEdge) / (NIR + RedEdge)
function ndre(nir, redEdge) {
    if (!redEdge) return null;
    if (nir.length !== redEdge.length) throw new Error("Bands length mismatch");
    const result = new Float32Array(nir.length);
    for (let i = 0; i < nir.length; i++) {
        const n = nir[i];
        const re = redEdge[i];
        if (n + re === 0) result[i] = 0;
        else result[i] = (n - re) / (n + re);
    }
    return result;
}

// SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
function savi(nir, red, L = 0.5) {
    if (nir.length !== red.length) throw new Error("Bands length mismatch");
    const result = new Float32Array(nir.length);
    for (let i = 0; i < nir.length; i++) {
        const n = nir[i];
        const r = red[i];
        if (n + r + L === 0) result[i] = 0;
        else result[i] = ((n - r) / (n + r + L)) * (1 + L);
    }
    return result;
}

// OSAVI = (NIR - Red) / (NIR + Red + 0.16)
function osavi(nir, red) {
    if (nir.length !== red.length) throw new Error("Bands length mismatch");
    const result = new Float32Array(nir.length);
    for (let i = 0; i < nir.length; i++) {
        const n = nir[i];
        const r = red[i];
        if (n + r + 0.16 === 0) result[i] = 0;
        else result[i] = (n - r) / (n + r + 0.16);
    }
    return result;
}

module.exports = {
    ndvi,
    gndvi,
    ndre,
    savi,
    osavi
};
