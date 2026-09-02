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

if (!source.includes('qr-tree-studio-manual-theme-state')) {
  throw new Error('Manual theme infrastructure must be applied before QR material theming.');
}
if (!source.includes('themeMix: f32') || !source.includes('themeMix: _qrThemeMixRefInner.current')) {
  throw new Error('Shared WebGPU themeMix infrastructure is missing.');
}

// Guard the QR encoder/matrix conversion and block geometry. This script may
// repaint the generated object, but it must never alter payload encoding,
// module placement, block types, block positions, or block heights.
const matrixSourceBefore = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation');
const geometrySourceBefore = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry');

if (!source.includes('qr-tree-studio-dark-qr-block-materials')) {
  const blockToneAnchor = `  let grayB = dot(hdr, vec3f(0.299, 0.587, 0.114));\\n  hdr = mixhvec3f(grayB), hdr, 1.25);\\n`;
  const blockThemeMaterial = `${blockToneAnchor}\\n  // qr-tree-studio-dark-qr-block-materials\\n  // Theme only the final shaded material. The QR matrix, polarity, geometry,\\n  // finder patterns, and quiet-zone cell layout remain untouched.\\n  let qrThemeMix = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let qrFlatMix = smoothstep(0.70, 0.98, progress);\\n  let qrBaseLayer = 1.0 - step(0.5, layer);\\n  let qrTopFace = step(0.5, input.faceNy);\\n  let qrDarkModule = step(0.5, f32(blockType));\\n  let qrLumaWeights = vec3f(0.299, 0.587, 0.114);\\n\\n  if (qrThemeMix > 0.0001) {\\n    if (qrBaseLayer > 0.5 && qrTopFace > 0.5) {\\n      // Logical light modules become a season-tinted graphite field. In the\\n      // fully flattened QR view, texture variation converges to zero.\\n      var qrGraphite3d = vec3f(0.40, 0.41, 0.43);\\n      var qrGraphiteFlat = vec3f(0.55, 0.56, 0.58);\\n      if (season < 0.5) {\\n        qrGraphite3d = vec3f(0.41, 0.39, 0.43);\\n        qrGraphiteFlat = vec3f(0.56, 0.53, 0.58);\\n      } else if (season < 1.5) {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.39);\\n        qrGraphiteFlat = vec3f(0.52, 0.57, 0.54);\\n      } else if (season < 2.5) {\\n        qrGraphite3d = vec3f(0.43, 0.39, 0.35);\\n        qrGraphiteFlat = vec3f(0.58, 0.54, 0.49);\\n      } else {\\n        qrGraphite3d = vec3f(0.37, 0.42, 0.47);\\n        qrGraphiteFlat = vec3f(0.51, 0.56, 0.61);\\n      }\\n      let qrSurfaceVariation = (noise1 - 0.5) * (1.0 - qrFlatMix) * 0.045;\\n      let qrLightTarget = clamp(\\n        mix(qrGraphite3d, qrGraphiteFlat, qrFlatMix) * (1.0 + qrSurfaceVariation),\\n        vec3f(0.30),\\n        vec3f(0.64)\\n      );\\n\\n      // Logical dark modules retain the current seasonal/custom hue while\\n      // being normalized to a deliberately lower luminance band.\\n      let qrSourceLuma = max(dot(hdr, qrLumaWeights), 0.01);\\n      let qrSourceHue = clamp(hdr / qrSourceLuma, vec3f(0.28), vec3f(2.8));\\n      let qrDarkTargetLuma = mix(0.18, 0.105, qrFlatMix);\\n      let qrDarkTarget = clamp(\\n        qrSourceHue * qrDarkTargetLuma,\\n        vec3f(0.025),\\n        vec3f(0.28)\\n      );\\n      let qrModuleTarget = mix(qrLightTarget, qrDarkTarget, qrDarkModule);\\n      hdr = mix(hdr, qrModuleTarget, qrThemeMix);\\n    } else if (qrBaseLayer > 0.5) {\\n      // The platform sides and underside become dark stone. They remain less\\n      // visually prominent than the top-plane QR field.\\n      let qrSideFace = step(-0.5, input.faceNy);\\n      let qrPlatformBottom = vec3f(0.075, 0.085, 0.10);\\n      let qrPlatformSide = vec3f(0.16, 0.18, 0.20);\\n      let qrPlatformVariation = 1.0 + (noise2 - 0.5) * (1.0 - qrFlatMix) * 0.08;\\n      let qrPlatformTarget = mix(qrPlatformBottom, qrPlatformSide, qrSideFace) * qrPlatformVariation;\\n      hdr = mix(hdr, qrPlatformTarget, qrThemeMix);\\n    } else if (blockType == 1 || blockType == 3 || blockType == 4) {\\n      // Raised voxel foliage follows the same leaf hue, but stays brighter\\n      // than the final QR modules while the tree is in its artistic 3D pose.\\n      let qrFoliageSourceLuma = max(dot(hdr, qrLumaWeights), 0.01);\\n      let qrFoliageHue = clamp(hdr / qrFoliageSourceLuma, vec3f(0.30), vec3f(2.7));\\n      let qrFoliageTargetLuma = mix(0.225, 0.12, qrFlatMix);\\n      let qrFoliageTarget = clamp(\\n        qrFoliageHue * qrFoliageTargetLuma,\\n        vec3f(0.03),\\n        vec3f(0.34)\\n      );\\n      hdr = mix(hdr, qrFoliageTarget, qrThemeMix);\\n    } else if (blockType == 2 || blockType == 5) {\\n      let qrBarkTarget = mix(vec3f(0.18, 0.105, 0.07), vec3f(0.10, 0.065, 0.045), qrFlatMix);\\n      hdr = mix(hdr, qrBarkTarget, qrThemeMix * 0.82);\\n    }\\n  }\\n`;
  replaceOnce(blockToneAnchor, blockThemeMaterial, 'theme-aware QR block and platform materials');
}

if (!source.includes('qr-tree-studio-dark-qr-flower-materials')) {
  const flowerToneAnchor = `  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\\n  ldr = mix(vec3f(gray), ldr, 1.9);\\n`;
  const flowerThemeMaterial = `${flowerToneAnchor}\\n  // qr-tree-studio-dark-qr-flower-materials\\n  // Petals and leaves keep their seasonal/custom hue, while dark mode moves\\n  // them into the dark-module luminance family. At the QR endpoint the range\\n  // tightens so highlights, snow, and subsurface light cannot fragment cells.\\n  let qrFlowerTheme = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let qrFlowerFlat = smoothstep(0.70, 0.98, uniforms.progress);\\n  if (qrFlowerTheme > 0.0001) {\\n    let qrFlowerWeights = vec3f(0.299, 0.587, 0.114);\\n    let qrFlowerSourceLuma = max(dot(baseColor, qrFlowerWeights), 0.01);\\n    let qrFlowerHue = clamp(baseColor / qrFlowerSourceLuma, vec3f(0.28), vec3f(2.8));\\n    let qrFlowerTargetLuma = mix(0.225, 0.105, qrFlowerFlat);\\n    let qrFlowerTarget = clamp(\\n      qrFlowerHue * qrFlowerTargetLuma,\\n      vec3f(0.025),\\n      vec3f(0.31)\\n    );\\n    ldr = mix(ldr, qrFlowerTarget, qrFlowerTheme);\\n  }\\n`;
  replaceOnce(flowerToneAnchor, flowerThemeMaterial, 'theme-aware leaf and petal materials');
}

if (!source.includes('qr-tree-studio-dark-qr-branch-materials')) {
  const branchToneAnchor = `  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\\n  ldr = mix(vec3f(gray), ldr, 1.25);\\n\\n  return vec4f(ldr, 1.0);\\n}\\n",
              depthWrite: true,
              depthCompare: "less"`;
  const branchThemeMaterial = `  let gray = dot(ldr, vec3f(0.299, 0.587, 0.114));\\n  ldr = mix(vec3f(gray), ldr, 1.25);\\n\\n  // qr-tree-studio-dark-qr-branch-materials\\n  let qrBranchTheme = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let qrBranchTarget = vec3f(0.16, 0.095, 0.065);\\n  ldr = mix(ldr, qrBranchTarget, qrBranchTheme * 0.76);\\n\\n  return vec4f(ldr, 1.0);\\n}\\n",
              depthWrite: true,
              depthCompare: "less"`;
  replaceOnce(branchToneAnchor, branchThemeMaterial, 'theme-aware branch materials');
}

// Discard a settled-theme snapshot before toggling. The live WebGPU canvas then
// carries the complete transition; a new image is captured only at the endpoint
// by the existing snapshot synchronizer.
if (!source.includes('qr-tree-studio-snapshot-theme-invalidation')) {
  replaceOnce(
    'onClick={() => _setQrThemeMode(_qrMode => _qrMode === "dark" ? "light" : "dark")}',
    'onClick={() => { /* qr-tree-studio-snapshot-theme-invalidation */ _0x4457f4.current = ""; _0x23d318(""); _setQrThemeMode(_qrMode => _qrMode === "dark" ? "light" : "dark"); }}',
    'stale QR snapshot invalidation'
  );
}

if (!source.includes('qr-tree-studio-snapshot-theme-fade')) {
  replaceOnce(
    `          objectFit: "fill",\n          cursor: "pointer",\n          display: "block"`,
    `          objectFit: "fill",\n          cursor: "pointer",\n          display: "block",\n          animation: "qrSnapshotThemeIn 180ms cubic-bezier(.22, 1, .36, 1) both" /* qr-tree-studio-snapshot-theme-fade */`,
    'QR snapshot endpoint fade-in'
  );
}

// The advisory now evaluates the two QR module families themselves rather than
// comparing the decorative tree with the page background. It remains manual.
if (!source.includes('qr-tree-studio-module-contrast-advisory')) {
  const oldContrastBlock = `  const _qrTreeLuminance = _qrRelativeLuminance(_qrTreeColor);\n  const _qrLightBackground = _qrLightBackgroundRgb[_0x153546] || _qrLightBackgroundRgb[1];\n  const _qrDarkBackground = _qrDarkBackgroundRgb[_0x153546] || _qrDarkBackgroundRgb[1];\n  const _qrCurrentBackground = _qrResolvedTheme === "dark" ? _qrDarkBackground : _qrLightBackground;\n  const _qrAlternativeBackground = _qrResolvedTheme === "dark" ? _qrLightBackground : _qrDarkBackground;\n  const _qrCurrentContrast = _qrContrastRatio(_qrTreeLuminance, _qrRelativeLuminance(_qrCurrentBackground));\n  const _qrAlternativeContrast = _qrContrastRatio(_qrTreeLuminance, _qrRelativeLuminance(_qrAlternativeBackground));\n  const _qrRecommendedTheme = _qrResolvedTheme === "dark" ? "light" : "dark";\n  const _qrShouldSuggestTheme = _qrCurrentContrast < 1.72 && _qrAlternativeContrast > _qrCurrentContrast + 0.45;`;
  const newContrastBlock = `  /* qr-tree-studio-module-contrast-advisory */\n  const _qrDisplayLuma = _qrColor =>\n    0.299 * _qrColor[0] + 0.587 * _qrColor[1] + 0.114 * _qrColor[2];\n  const _qrClampChannel = _qrValue => Math.min(1, Math.max(0, _qrValue));\n  const _qrDarkModuleColor = _qrTheme => {\n    const _qrSourceLuma = Math.max(_qrDisplayLuma(_qrTreeColor), 0.01);\n    const _qrTargetLuma = _qrTheme === "dark" ? 0.105 : 0.25;\n    return _qrTreeColor.map(_qrChannel =>\n      _qrClampChannel(Math.min(0.31, Math.max(0.025, _qrChannel / _qrSourceLuma * _qrTargetLuma)))\n    );\n  };\n  const _qrDarkLightFields = [\n    [0.56, 0.53, 0.58],\n    [0.52, 0.57, 0.54],\n    [0.58, 0.54, 0.49],\n    [0.51, 0.56, 0.61]\n  ];\n  const _qrLightLightFields = [\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56],\n    [0.78, 0.70, 0.56]\n  ];\n  const _qrModuleColorsForTheme = _qrTheme => ({\n    light: (_qrTheme === "dark" ? _qrDarkLightFields : _qrLightLightFields)[_0x153546] || _qrLightLightFields[1],\n    dark: _qrDarkModuleColor(_qrTheme)\n  });\n  const _qrCurrentModules = _qrModuleColorsForTheme(_qrResolvedTheme);\n  const _qrAlternativeTheme = _qrResolvedTheme === "dark" ? "light" : "dark";\n  const _qrAlternativeModules = _qrModuleColorsForTheme(_qrAlternativeTheme);\n  const _qrCurrentContrast = _qrContrastRatio(\n    _qrRelativeLuminance(_qrCurrentModules.light),\n    _qrRelativeLuminance(_qrCurrentModules.dark)\n  );\n  const _qrAlternativeContrast = _qrContrastRatio(\n    _qrRelativeLuminance(_qrAlternativeModules.light),\n    _qrRelativeLuminance(_qrAlternativeModules.dark)\n  );\n  const _qrRecommendedTheme = _qrAlternativeTheme;\n  const _qrShouldSuggestTheme = _qrCurrentContrast < 3.0 && _qrAlternativeContrast > _qrCurrentContrast + 0.75;`;
  replaceOnce(oldContrastBlock, newContrastBlock, 'QR module contrast advisory');
}

const matrixSourceAfter = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation after theming');
const geometrySourceAfter = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry after theming');
if (matrixSourceAfter !== matrixSourceBefore) {
  throw new Error('QR matrix generation changed while applying material theming.');
}
if (geometrySourceAfter !== geometrySourceBefore) {
  throw new Error('QR block geometry changed while applying material theming.');
}

const requiredFragments = [
  'qr-tree-studio-dark-qr-block-materials',
  'qr-tree-studio-dark-qr-flower-materials',
  'qr-tree-studio-dark-qr-branch-materials',
  'qr-tree-studio-snapshot-theme-invalidation',
  'qr-tree-studio-snapshot-theme-fade',
  'qr-tree-studio-module-contrast-advisory',
  'let qrDarkModule = step(0.5, f32(blockType))',
  'let qrFlatMix = smoothstep(0.70, 0.98, progress)',
  'let qrFlowerFlat = smoothstep(0.70, 0.98, uniforms.progress)',
  '_0x4457f4.current = ""',
  '_0x23d318("")'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required QR material-theme fragment was not applied: ${fragment}`);
  }
}

// Verify the intended dark-mode module targets remain safely ordered. This is a
// build-time material sanity check; runtime decoder/device validation is still
// performed separately before production promotion.
const representativeLeafColors = [
  [0.91, 0.63, 0.69],
  [0.15, 0.38, 0.12],
  [0.94, 0.58, 0.17],
  [0.19, 0.36, 0.29],
  [0.58, 0.30, 0.82],
  [0.95, 0.18, 0.15],
  [0.95, 0.68, 0.02],
  [0.22, 0.55, 0.96],
  [0.87, 0.90, 0.91]
];
const darkLightFields = [
  [0.56, 0.53, 0.58],
  [0.52, 0.57, 0.54],
  [0.58, 0.54, 0.49],
  [0.51, 0.56, 0.61]
];
const displayLuma = color => 0.299 * color[0] + 0.587 * color[1] + 0.114 * color[2];
const linearChannel = channel => channel <= 0.04045
  ? channel / 12.92
  : ((channel + 0.055) / 1.055) ** 2.4;
const relativeLuminance = color =>
  0.2126 * linearChannel(color[0]) +
  0.7152 * linearChannel(color[1]) +
  0.0722 * linearChannel(color[2]);
const contrastRatio = (first, second) => {
  const firstLuma = relativeLuminance(first);
  const secondLuma = relativeLuminance(second);
  return (Math.max(firstLuma, secondLuma) + 0.05) / (Math.min(firstLuma, secondLuma) + 0.05);
};
for (const leaf of representativeLeafColors) {
  const sourceLuma = Math.max(displayLuma(leaf), 0.01);
  const darkModule = leaf.map(channel => Math.min(0.28, Math.max(0.025, channel / sourceLuma * 0.105)));
  for (const lightField of darkLightFields) {
    if (contrastRatio(lightField, darkModule) < 4.5) {
      throw new Error(`Unsafe dark QR contrast for representative color ${leaf.join(',')}.`);
    }
  }
}

fs.writeFileSync(appFile, source);
console.log('Applied theme-aware QR modules, dark platform materials, hue-preserving foliage, and snapshot-safe transitions without changing QR matrix or geometry.');
