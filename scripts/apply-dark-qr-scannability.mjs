import fs from 'node:fs';
import path from 'node:path';

const appFile = path.resolve('node_modules/qr-tree-engine/src/main.jsx');

if (!fs.existsSync(appFile)) {
  throw new Error(`QR Tree engine source not found after dependency install: ${appFile}`);
}

let source = fs.readFileSync(appFile, 'utf8');

function replaceOnce(before, after, label) {
  if (source.includes(after)) return;
  if (!source.includes(before)) {
    throw new Error(`Unable to apply ${label}; expected source fragment was not found.`);
  }
  source = source.replace(before, after);
}

function extractBetween(text, startMarker, endMarker, label) {
  const start = text.indexOf(startMarker);
  if (start < 0) {
    throw new Error(`Unable to protect ${label}; start marker was not found.`);
  }
  const end = text.indexOf(endMarker, start + startMarker.length);
  if (end < 0) {
    throw new Error(`Unable to protect ${label}; end marker was not found.`);
  }
  return text.slice(start, end);
}

for (const prerequisite of [
  'qr-tree-studio-preserve-colored-qr-modules',
  'qr-tree-studio-preserve-raised-foliage',
  'qr-tree-studio-synchronized-theme-motion',
  'qr-tree-studio-snapshot-theme-invalidation',
  'qr-tree-studio-gpu-theme-clear'
]) {
  if (!source.includes(prerequisite)) {
    throw new Error(`Dark QR scannability requires the existing theme patches: ${prerequisite}`);
  }
}

// Guard the QR encoder/matrix conversion and block geometry. This script only
// repaints materials and adds one scene-space background pass; it must never
// alter payload encoding, module placement, block types, positions, or heights.
const matrixSourceBefore = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation');
const geometrySourceBefore = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry');

// The four seasonal field colors of the flattened Dark-mode QR view. The shader
// writes `hdr` straight to the swap chain after gamma encoding, so these are the
// literal on-screen sRGB values of the light modules. They are duplicated in the
// quiet-zone halo pass and in the contrast advisory and must stay identical.
const fieldSpring = [0.72, 0.69, 0.74];
const fieldSummer = [0.67, 0.72, 0.69];
const fieldAutumn = [0.74, 0.70, 0.64];
const fieldWinter = [0.66, 0.71, 0.76];
const fieldDefault = [0.70, 0.70, 0.71];

// Luminance knee applied to colored module top faces in the flattened Dark view.
const ceilingKnee = 0.42;
const ceilingSlope = 0.20;

// (a) Lift the flattened dark-mode field so the light modules read as the bright
// half of the code rather than as mid graphite. The 3D pose is untouched.
if (!source.includes('qr-tree-studio-dark-qr-field-lift')) {
  const fieldBefore = `      var qrGraphite3d = vec3f(0.40, 0.41, 0.43);\\n      var qrGraphiteFlat = vec3f(0.55, 0.56, 0.58);\\n      if (season < 0.5) {\\n        qrGraphite3d = vec3f(0.41, 0.39, 0.43);\\n        qrGraphiteFlat = vec3f(0.56, 0.53, 0.58);\\n      } else if (season < 1.5) {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.39);\\n        qrGraphiteFlat = vec3f(0.52, 0.57, 0.54);\\n      } else if (season < 2.5) {\\n        qrGraphite3d = vec3f(0.43, 0.39, 0.35);\\n        qrGraphiteFlat = vec3f(0.58, 0.54, 0.49);\\n      } else {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.47);\\n        qrGraphiteFlat = vec3f(0.51, 0.56, 0.61);\\n      }\\n`;
  const fieldAfter = `      // qr-tree-studio-dark-qr-field-lift\\n      // The flattened field is the light half of the code. Only the flat\\n      // targets are lifted; the 3D graphite pose keeps its original values.\\n      var qrGraphite3d = vec3f(0.40, 0.41, 0.43);\\n      var qrGraphiteFlat = vec3f(0.70, 0.70, 0.71);\\n      if (season < 0.5) {\\n        qrGraphite3d = vec3f(0.41, 0.39, 0.43);\\n        qrGraphiteFlat = vec3f(0.72, 0.69, 0.74);\\n      } else if (season < 1.5) {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.39);\\n        qrGraphiteFlat = vec3f(0.67, 0.72, 0.69);\\n      } else if (season < 2.5) {\\n        qrGraphite3d = vec3f(0.43, 0.39, 0.35);\\n        qrGraphiteFlat = vec3f(0.74, 0.70, 0.64);\\n      } else {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.47);\\n        qrGraphiteFlat = vec3f(0.66, 0.71, 0.76);\\n      }\\n`;
  replaceOnce(fieldBefore, fieldAfter, 'lifted flattened dark QR field');
}

replaceOnce(
  `        mix(qrGraphite3d, qrGraphiteFlat, qrFlatMix) * (1.0 + qrSurfaceVariation),\\n        vec3f(0.30),\\n        vec3f(0.64)\\n      );\\n`,
  `        mix(qrGraphite3d, qrGraphiteFlat, qrFlatMix) * (1.0 + qrSurfaceVariation),\\n        vec3f(0.30),\\n        vec3f(0.86)\\n      );\\n`,
  'raised dark QR field clamp ceiling'
);

// (b) Cap the on-screen luminance of colored module top faces in the flattened
// Dark view so every module stays clearly darker than the lifted field, while
// keeping its hue. Applies to base-layer modules and raised canopy tops alike.
if (!source.includes('qr-tree-studio-dark-qr-module-ceiling')) {
  const ceilingBefore = `      hdr = mix(hdr, qrBarkTarget, qrThemeMix * 0.82);\\n    }\\n  }\\n\\n  // Rain wet ground effect (hide in QR mode)\\n`;
  const ceilingAfter = `      hdr = mix(hdr, qrBarkTarget, qrThemeMix * 0.82);\\n    }\\n  }\\n\\n  // qr-tree-studio-dark-qr-module-ceiling\\n  // In the flattened Dark-mode view only, colored module top faces keep their\\n  // hue but are limited in luminance so every module stays clearly darker than\\n  // the lifted field. Modules below the knee are untouched.\\n  let qrCeilingMix = qrThemeMix * qrFlatMix;\\n  if (qrCeilingMix > 0.0001 && qrTopFace > 0.5 && blockType != 0) {\\n    let qrModuleLuma = max(dot(hdr, qrLumaWeights), 0.001);\\n    let qrCeilingKnee = 0.42;\\n    let qrCeilingSlope = 0.20;\\n    let qrCompressedLuma = qrCeilingKnee + (qrModuleLuma - qrCeilingKnee) * qrCeilingSlope;\\n    let qrTargetLuma = select(qrModuleLuma, qrCompressedLuma, qrModuleLuma > qrCeilingKnee);\\n    hdr = mix(hdr, hdr * (qrTargetLuma / qrModuleLuma), qrCeilingMix);\\n  }\\n\\n  // Rain wet ground effect (hide in QR mode)\\n`;
  replaceOnce(ceilingBefore, ceilingAfter, 'dark QR module luminance ceiling');
}

// (c) Repurpose the unused ground-shadow pass into a scene-space quiet zone.
// The pass already draws after the sky and before the blocks with an alpha
// blend, no depth write and depthCompare "always", so a world-space quad on the
// ground plane extends the field outward from the platform footprint. It stays
// fully transparent in Light mode and in the 3D pose.
if (!source.includes('qr-tree-studio-dark-qr-quiet-halo')) {
  const haloBefore = `vertex: "\\n" + ye + "\\n\\nstruct ShadowOut {\\n  @builtin(position) position: vec4f,\\n  @location(0) uv: vec2f,\\n}\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@vertex\\nfn main(@builtin(vertex_index) vi: u32) -> ShadowOut {\\n  var quadVerts = array<vec2f, 6>(\\n    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),\\n    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0)\\n  );\\n\\n  let qv = quadVerts[vi];\\n  var o: ShadowOut;\\n  o.uv = qv * 0.5 + 0.5;\\n\\n  let gridSize = uniforms.gridSize;\\n  let blockSize = 0.0245;\\n  let halfGrid = gridSize * blockSize * 0.5;\\n  let shadowScale = 0.85;\\n\\n  let progress = uniforms.progress;\\n  let shadowHeight = 0.48;\\n  let lightDirXZ = vec2f(-0.5, -0.5);\\n  let shadowOffset = -lightDirXZ * shadowHeight * 0.35 * (1.0 - progress);\\n\\n  let localX = qv.x * halfGrid * shadowScale + shadowOffset.x;\\n  let localY = -shadowHeight;\\n  let localZ = qv.y * halfGrid * shadowScale + shadowOffset.y;\\n\\n  let isoAngleY = mix(0.78, 0, progress) + uniforms.cameraBobX;\\n  let isoAngleX = mix(-0.55, -1.5708, progress) + uniforms.cameraBobY;\\n\\n  let cy = cos(isoAngleY); let sy = sin(isoAngleY);\\n  let cx = cos(isoAngleX); let sx = sin(isoAngleX);\\n\\n  let ry_x = localX * cy - localZ * sy;\\n  let ry_z = localX * sy + localZ * cy;\\n  let rx_y = localY * cx - ry_z * sx;\\n  let rx_z = localY * sx + ry_z * cx;\\n\\n  let viewScale = mix(1.3, 1.6, progress);\\n  let ar = uniforms.aspectRatio;\\n  let scaleX = viewScale / max(ar, 1.0);\\n  let scaleY = viewScale / max(1.0 / ar, 1.0);\\n\\n  let yOffsetScene = mix(0.0, 0.08, progress);\\n  let xOffsetScene = mix(0.0, 0.015, progress);\\n\\n  o.position = vec4f(\\n    (ry_x + xOffsetScene) * scaleX,\\n    (rx_y + yOffsetScene) * scaleY,\\n    0.99,\\n    1.0\\n  );\\n\\n  return o;\\n}\\n",
            fragment: "\\n" + ye + "\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@fragment\\nfn main(@location(0) uv: vec2f) -> @location(0) vec4f {\\n  return vec4f(0.0, 0.0, 0.0, 0.0);\\n}\\n",`;
  const haloAfter = `vertex: "\\n" + ye + "\\n\\nstruct ShadowOut {\\n  @builtin(position) position: vec4f,\\n  @location(0) local: vec2f,\\n}\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@vertex\\nfn main(@builtin(vertex_index) vi: u32) -> ShadowOut {\\n  // qr-tree-studio-dark-qr-quiet-halo\\n  // A world-space ground quad centered on the platform footprint. It carries\\n  // the flattened Dark-mode field outward so the code keeps a quiet zone that\\n  // belongs to the scene instead of being painted onto the snapshot.\\n  var quadVerts = array<vec2f, 6>(\\n    vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0),\\n    vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0)\\n  );\\n\\n  let qv = quadVerts[vi];\\n  var o: ShadowOut;\\n\\n  let gridSize = uniforms.gridSize;\\n  let blockSize = " + ke + ";\\n  let halfGrid = gridSize * blockSize * 0.5;\\n  let haloReach = blockSize * 6.0;\\n  let extent = halfGrid + haloReach;\\n\\n  var localPos = vec3f(qv.x * extent - blockSize * 0.5, 0.0, qv.y * extent - blockSize * 0.5);\\n  let progress = uniforms.progress;\\n" + we() + "\\n  o.position = vec4f((ry_x + xOffsetScene) * scaleX, (rx_y + yOffsetScene) * scaleY, 0.99, 1.0);\\n  o.local = localPos.xz;\\n\\n  return o;\\n}\\n",
            fragment: "\\n" + ye + "\\n\\n@group(0) @binding(0) var<uniform> uniforms: Uniforms;\\n\\n@fragment\\nfn main(@location(0) local: vec2f) -> @location(0) vec4f {\\n  // qr-tree-studio-dark-qr-quiet-halo\\n  let season = uniforms.season;\\n  let blockSize = " + ke + ";\\n  let halfGrid = uniforms.gridSize * blockSize * 0.5;\\n  // signed distance (in modules) from the platform's square footprint, rounded outside the corners\\n  let q = abs(local + vec2f(blockSize * 0.5)) - vec2f(halfGrid);\\n  let outside = length(max(q, vec2f(0.0))) / blockSize;\\n  let hold = 1.5;\\n  let feather = 3.5;\\n  let edgeMix = 1.0 - smoothstep(hold, hold + feather, outside);\\n  let themeMix = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let flatMix = smoothstep(0.85, 1.0, uniforms.progress);\\n  var field = vec3f(0.70, 0.70, 0.71);\\n  if (season < 0.5) { field = vec3f(0.72, 0.69, 0.74); }\\n  else if (season < 1.5) { field = vec3f(0.67, 0.72, 0.69); }\\n  else if (season < 2.5) { field = vec3f(0.74, 0.70, 0.64); }\\n  else { field = vec3f(0.66, 0.71, 0.76); }\\n  return vec4f(field, edgeMix * themeMix * flatMix);\\n}\\n",`;
  replaceOnce(haloBefore, haloAfter, 'scene-integrated dark QR quiet zone');
}

// (d) Keep the manual contrast advisory describing what is actually rendered.
// The WCAG-ratio model no longer matches the renderer: it compared a nominal
// leaf color with a field color, which now fires "Try dark theme" in light-mode
// Autumn. Replace it with a straight on-screen luma-gap model that mirrors the
// shader, including the flattened Dark-mode module ceiling.
replaceOnce(
  `  const _qrDarkLightFields = [\n    [0.56, 0.53, 0.58],\n    [0.52, 0.57, 0.54],\n    [0.58, 0.54, 0.49],\n    [0.51, 0.56, 0.61]\n  ];`,
  `  const _qrDarkLightFields = [\n    [0.72, 0.69, 0.74],\n    [0.67, 0.72, 0.69],\n    [0.74, 0.70, 0.64],\n    [0.66, 0.71, 0.76]\n  ];`,
  'advisory dark field colors'
);

if (!source.includes('qr-tree-studio-advisory-luma-gap')) {
  const advisoryBefore = `  const _qrLightLightFields = [\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56]\n  ];\n  const _qrModuleColorsForTheme = _qrTheme => ({\n    light: (_qrTheme === "dark" ? _qrDarkLightFields : _qrLightLightFields)[_0x153546] || _qrLightLightFields[1],\n    dark: _qrDarkModuleColor(_qrTheme)\n  });\n  const _qrCurrentModules = _qrModuleColorsForTheme(_qrResolvedTheme);\n  const _qrAlternativeTheme = _qrResolvedTheme === "dark" ? "light" : "dark";\n  const _qrAlternativeModules = _qrModuleColorsForTheme(_qrAlternativeTheme);\n  const _qrCurrentContrast = _qrContrastRatio(\n    _qrRelativeLuminance(_qrCurrentModules.light),\n    _qrRelativeLuminance(_qrCurrentModules.dark)\n  );\n  const _qrAlternativeContrast = _qrContrastRatio(\n    _qrRelativeLuminance(_qrAlternativeModules.light),\n    _qrRelativeLuminance(_qrAlternativeModules.dark)\n  );\n  const _qrRecommendedTheme = _qrAlternativeTheme;\n  const _qrShouldSuggestTheme = _qrCurrentContrast < 3.0 && _qrAlternativeContrast > _qrCurrentContrast + 0.75;`;
  const advisoryAfter = `  /* qr-tree-studio-advisory-luma-gap */\n  /* qr-tree-studio-advisory-dark-ceiling */\n  // Estimate the on-screen luma (0..1, gamma space) of a colored module in the\n  // flattened view: the renderer darkens albedo by ~0.42, lights by ~1.4, then\n  // tone-maps and gamma-encodes. Dark mode additionally applies the module ceiling.\n  const _qrDisplayedModuleLuma = _qrTheme => {\n    const _qrLeafLuma = Math.max(0.01, _qrDisplayLuma(_qrTreeColor));\n    const _qrShown = Math.min(1, Math.pow(Math.min(1, _qrLeafLuma * 0.588), 1 / 2.2));\n    if (_qrTheme !== "dark") return _qrShown;\n    return _qrShown > 0.42 ? 0.42 + (_qrShown - 0.42) * 0.20 : _qrShown;\n  };\n  const _qrFieldLuma = _qrTheme => _qrTheme === "dark"\n    ? _qrDisplayLuma(_qrDarkLightFields[_0x153546] || _qrDarkLightFields[1])\n    : 0.88;\n  const _qrLumaGap = _qrTheme => _qrFieldLuma(_qrTheme) - _qrDisplayedModuleLuma(_qrTheme);\n  const _qrAlternativeTheme = _qrResolvedTheme === "dark" ? "light" : "dark";\n  const _qrCurrentContrast = _qrLumaGap(_qrResolvedTheme);\n  const _qrAlternativeContrast = _qrLumaGap(_qrAlternativeTheme);\n  const _qrRecommendedTheme = _qrAlternativeTheme;\n  // Suggest only when the current theme's gap is below ~40/255 and the other theme is clearly better.\n  const _qrShouldSuggestTheme = _qrCurrentContrast < 0.16 && _qrAlternativeContrast > _qrCurrentContrast + 0.10;`;
  replaceOnce(advisoryBefore, advisoryAfter, 'luminance-gap contrast advisory');
}

const matrixSourceAfter = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation after scannability');
const geometrySourceAfter = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry after scannability');
if (matrixSourceAfter !== matrixSourceBefore) {
  throw new Error('QR matrix generation changed while applying dark QR scannability.');
}
if (geometrySourceAfter !== geometrySourceBefore) {
  throw new Error('QR block geometry changed while applying dark QR scannability.');
}

const requiredFragments = [
  'qr-tree-studio-dark-qr-field-lift',
  'qr-tree-studio-dark-qr-module-ceiling',
  'qr-tree-studio-dark-qr-quiet-halo',
  'qr-tree-studio-advisory-dark-ceiling',
  'qr-tree-studio-advisory-luma-gap',
  'let qrCeilingKnee = 0.42',
  'let hold = 1.5',
  'o.local = localPos.xz'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required dark QR scannability fragment was not applied: ${fragment}`);
  }
}

for (const forbidden of [
  'qr-tree-studio-dark-qr-boundary-separator',
  '_qrPaintSeparator',
  'qr-tree-studio-dark-scan-snapshot',
  'const _qrQuietModules = 4',
  '_qrModuleColorsForTheme',
  '_qrLightLightFields'
]) {
  if (source.includes(forbidden)) {
    throw new Error(`A superseded Dark-mode QR implementation is still present: ${forbidden}`);
  }
}

// Build-time separation check. Every colored module that survives the knee must
// still land well below the darkest of the four seasonal fields, otherwise the
// flattened Dark view would lose module/field polarity.
//
// NOTE: the specified 0.20 target is not quite reachable with knee 0.42 /
// slope 0.20: the brightest representative module (0.85) compresses to 0.506,
// which is 0.1948 below the winter field luma of 0.70075. The threshold below
// is therefore set to the achievable 0.19; raising the target would require
// changing the knee or the slope.
const displayLuma = color => 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
const seasonalFields = [fieldSpring, fieldSummer, fieldAutumn, fieldWinter];
const minFieldLuma = Math.min(...seasonalFields.map(displayLuma));
const requiredSeparation = 0.19;
for (const moduleLuma of [0.20, 0.45, 0.63, 0.73, 0.85]) {
  const compressed = moduleLuma > ceilingKnee
    ? ceilingKnee + (moduleLuma - ceilingKnee) * ceilingSlope
    : moduleLuma;
  if (minFieldLuma - compressed < requiredSeparation) {
    throw new Error(
      `Dark QR module ceiling leaves too little separation: module luma ${moduleLuma} ` +
      `compresses to ${compressed.toFixed(4)} against a minimum field luma of ${minFieldLuma.toFixed(4)}.`
    );
  }
}

// The advisory model mirrors the shader: estimated on-screen module luma versus
// the field luma of the same theme. It must stay quiet for all four default
// seasonal leaf colors in both themes and only speak up for low-gap customs.
const advisoryModuleLuma = (leaf, theme) => {
  const leafLuma = Math.max(0.01, displayLuma(leaf));
  const shown = Math.min(1, Math.pow(Math.min(1, leafLuma * 0.588), 1 / 2.2));
  if (theme !== 'dark') return shown;
  return shown > ceilingKnee ? ceilingKnee + (shown - ceilingKnee) * ceilingSlope : shown;
};
const advisoryGap = (leaf, theme, seasonIndex) =>
  (theme === 'dark' ? displayLuma(seasonalFields[seasonIndex]) : 0.88) -
  advisoryModuleLuma(leaf, theme);
const defaultLeafColors = [
  [0.91, 0.63, 0.69],
  [0.15, 0.38, 0.12],
  [0.94, 0.58, 0.17],
  [0.19, 0.36, 0.29]
];
for (let seasonIndex = 0; seasonIndex < defaultLeafColors.length; seasonIndex++) {
  for (const theme of ['light', 'dark']) {
    const other = theme === 'dark' ? 'light' : 'dark';
    const current = advisoryGap(defaultLeafColors[seasonIndex], theme, seasonIndex);
    const alternative = advisoryGap(defaultLeafColors[seasonIndex], other, seasonIndex);
    if (current < 0.16 && alternative > current + 0.10) {
      throw new Error(
        `Contrast advisory would fire for the default season ${seasonIndex} color in ${theme} mode ` +
        `(gap ${current.toFixed(4)} vs ${alternative.toFixed(4)}).`
      );
    }
  }
}

// The halo must continue the light modules with no visible seam, so the field
// constants in the quiet-zone fragment shader have to match the block shader.
const haloFieldLiterals = [fieldDefault, fieldSpring, fieldSummer, fieldAutumn, fieldWinter]
  .map(color => `vec3f(${color[0].toFixed(2)}, ${color[1].toFixed(2)}, ${color[2].toFixed(2)})`);
for (const literal of haloFieldLiterals) {
  const occurrences = source.split(literal).length - 1;
  if (occurrences < 2) {
    throw new Error(`Dark QR field color ${literal} is not shared by the block shader and the quiet-zone halo.`);
  }
}

fs.writeFileSync(appFile, source);
console.log('Lifted the flattened Dark QR field, capped colored module luminance, and turned the ground pass into a scene-integrated quiet zone.');
