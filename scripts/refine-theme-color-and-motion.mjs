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

if (!source.includes('qr-tree-studio-dark-qr-block-materials') ||
    !source.includes('qr-tree-studio-dark-qr-flower-materials') ||
    !source.includes('qr-tree-studio-manual-theme-state')) {
  throw new Error('The QR material and manual-theme patches must run before the color/motion refinement.');
}

// Keep the logical colored QR modules on the exact same shaded material path in
// Light and Dark. Only the pale/light field is repainted for Dark mode.
if (!source.includes('qr-tree-studio-preserve-colored-qr-modules')) {
  const coloredModuleBefore = `      // Logical dark modules retain the current seasonal/custom hue while\\n      // being normalized to a deliberately lower luminance band.\\n      let qrSourceLuma = max(dot(hdr, qrLumaWeights), 0.01);\\n      let qrSourceHue = clamp(hdr / qrSourceLuma, vec3f(0.28), vec3f(2.8));\\n      let qrDarkTargetLuma = mix(0.18, 0.105, qrFlatMix);\\n      let qrDarkTarget = clamp(\\n        qrSourceHue * qrDarkTargetLuma,\\n        vec3f(0.025),\\n        vec3f(0.28)\\n      );\\n      let qrModuleTarget = mix(qrLightTarget, qrDarkTarget, qrDarkModule);\\n      hdr = mix(hdr, qrModuleTarget, qrThemeMix);\\n`;
  const coloredModuleAfter = `      // qr-tree-studio-preserve-colored-qr-modules\\n      // Logical colored modules retain the exact seasonal/custom shaded color\\n      // used by Light mode. Dark mode changes only the pale QR field around\\n      // them, so palette identity remains stable throughout the transition.\\n      let qrModuleTarget = mix(qrLightTarget, hdr, qrDarkModule);\\n      hdr = mix(hdr, qrModuleTarget, qrThemeMix);\\n`;
  replaceOnce(coloredModuleBefore, coloredModuleAfter, 'stable colored QR modules');
}

// Raised voxel foliage is artistic tree material, not background chrome. Do
// not remap it to a low-luminance Dark-mode target.
if (!source.includes('qr-tree-studio-preserve-raised-foliage')) {
  const raisedFoliageBefore = `    } else if (blockType == 1 || blockType == 3 || blockType == 4) {\\n      // Raised voxel foliage follows the same leaf hue, but stays brighter\\n      // than the final QR modules while the tree is in its artistic 3D pose.\\n      let qrFoliageSourceLuma = max(dot(hdr, qrLumaWeights), 0.01);\\n      let qrFoliageHue = clamp(hdr / qrFoliageSourceLuma, vec3f(0.30), vec3f(2.7));\\n      let qrFoliageTargetLuma = mix(0.225, 0.12, qrFlatMix);\\n      let qrFoliageTarget = clamp(\\n        qrFoliageHue * qrFoliageTargetLuma,\\n        vec3f(0.03),\\n        vec3f(0.34)\\n      );\\n      hdr = mix(hdr, qrFoliageTarget, qrThemeMix);\\n    } else if (blockType == 2 || blockType == 5) {`;
  const raisedFoliageAfter = `    } else if (blockType == 1 || blockType == 3 || blockType == 4) {\\n      // qr-tree-studio-preserve-raised-foliage\\n      // Preserve the original shaded foliage exactly in both themes.\\n    } else if (blockType == 2 || blockType == 5) {`;
  replaceOnce(raisedFoliageBefore, raisedFoliageAfter, 'stable raised foliage color');
}

// Petal and leaf meshes use the same seasonal/custom color in both themes.
if (!source.includes('qr-tree-studio-preserve-leaf-petal-color')) {
  const flowerThemeBefore = `  // qr-tree-studio-dark-qr-flower-materials\\n  // Petals and leaves keep their seasonal/custom hue, while dark mode moves\\n  // them into the dark-module luminance family. At the QR endpoint the range\\n  // tightens so highlights, snow, and subsurface light cannot fragment cells.\\n  let qrFlowerTheme = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let qrFlowerFlat = smoothstep(0.70, 0.98, uniforms.progress);\\n  if (qrFlowerTheme > 0.0001) {\\n    let qrFlowerWeights = vec3f(0.299, 0.587, 0.114);\\n    let qrFlowerSourceLuma = max(dot(baseColor, qrFlowerWeights), 0.01);\\n    let qrFlowerHue = clamp(baseColor / qrFlowerSourceLuma, vec3f(0.28), vec3f(2.8));\\n    let qrFlowerTargetLuma = mix(0.225, 0.105, qrFlowerFlat);\\n    let qrFlowerTarget = clamp(\\n      qrFlowerHue * qrFlowerTargetLuma,\\n      vec3f(0.025),\\n      vec3f(0.31)\\n    );\\n    ldr = mix(ldr, qrFlowerTarget, qrFlowerTheme);\\n  }\\n`;
  const flowerThemeAfter = `  // qr-tree-studio-dark-qr-flower-materials\\n  // qr-tree-studio-preserve-leaf-petal-color\\n  // Theme-independent foliage: retain the exact Light-mode leaf/petal result.\\n`;
  replaceOnce(flowerThemeBefore, flowerThemeAfter, 'stable leaf and petal color');
}

// The contrast hint must describe the final material behavior. Since the
// colored module is no longer recolored by theme, evaluate its original color.
if (!source.includes('qr-tree-studio-contrast-uses-stable-leaf-color')) {
  const advisoryBefore = `  const _qrDarkModuleColor = _qrTheme => {\n    const _qrSourceLuma = Math.max(_qrDisplayLuma(_qrTreeColor), 0.01);\n    const _qrTargetLuma = _qrTheme === "dark" ? 0.105 : 0.25;\n    return _qrTreeColor.map(_qrChannel =>\n      _qrClampChannel(Math.min(0.31, Math.max(0.025, _qrChannel / _qrSourceLuma * _qrTargetLuma)))\n    );\n  };`;
  const advisoryAfter = `  /* qr-tree-studio-contrast-uses-stable-leaf-color */\n  const _qrDarkModuleColor = _qrTheme =>\n    _qrTreeColor.map(_qrChannel => _qrClampChannel(_qrChannel));`;
  replaceOnce(advisoryBefore, advisoryAfter, 'contrast advisory for stable leaf colors');
}

// Start the GPU interpolation before the first painted frame after the toggle,
// rather than one effect phase later. This keeps UI and scene motion together.
if (!source.includes('qr-tree-studio-synchronized-theme-motion')) {
  replaceOnce(
    `  (0, m.useEffect)(() => {\n    if (_qrThemeAnimationRef.current) {`,
    `  /* qr-tree-studio-synchronized-theme-motion */\n  (0, m.useLayoutEffect)(() => {\n    if (_qrThemeAnimationRef.current) {`,
    'layout-synchronized theme animation'
  );
}

replaceOnce(
  '      const _qrEasedProgress = _qrRawProgress * _qrRawProgress * _qrRawProgress * (_qrRawProgress * (_qrRawProgress * 6 - 15) + 10);',
  '      const _qrEasedProgress = _qrRawProgress * _qrRawProgress * (3 - 2 * _qrRawProgress);',
  'shared smoothstep theme easing'
);

// Use one duration and one easing curve for every theme-sensitive UI surface.
// Interactive transform timings are intentionally left at their faster values.
const synchronizedTimingReplacements = [
  ['900ms cubic-bezier(.22, 1, .36, 1)', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['700ms cubic-bezier(.22, 1, .36, 1)', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['650ms cubic-bezier(.22, 1, .36, 1)', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['700ms ease', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['650ms ease', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['500ms ease', '900ms cubic-bezier(.4, 0, .2, 1)'],
  ['450ms ease', '900ms cubic-bezier(.4, 0, .2, 1)']
];
for (const [before, after] of synchronizedTimingReplacements) {
  source = source.split(before).join(after);
}

// Native color-scheme changes are discrete. Apply them at the end instead of
// letting the browser scrollbar/form theme jump at the start of the crossfade.
if (!source.includes('qr-tree-studio-deferred-color-scheme')) {
  replaceOnce(
    '    document.documentElement.style.colorScheme = _qrResolvedTheme;',
    `    /* qr-tree-studio-deferred-color-scheme */\n    const _qrPendingColorScheme = _qrResolvedTheme;\n    window.setTimeout(() => {\n      if (document.documentElement.dataset.qrTheme === _qrPendingColorScheme) {\n        document.documentElement.style.colorScheme = _qrPendingColorScheme;\n      }\n    }, 900);`,
    'deferred native color scheme'
  );
  replaceOnce(
    '      color: "var(--qr-fg)",\n      colorScheme: _qrResolvedTheme',
    '      color: "var(--qr-fg)"',
    'remove immediate root color-scheme switch'
  );
}
// Strip any additional style-object copy of the discrete native color scheme.
// The deferred document-level assignment above is the only remaining switch.
source = source.replace(/\n\s*colorScheme:\s*_qrResolvedTheme,?/g, '');

const requiredFragments = [
  'qr-tree-studio-preserve-colored-qr-modules',
  'qr-tree-studio-preserve-raised-foliage',
  'qr-tree-studio-preserve-leaf-petal-color',
  'qr-tree-studio-contrast-uses-stable-leaf-color',
  'qr-tree-studio-synchronized-theme-motion',
  'qr-tree-studio-deferred-color-scheme',
  'let qrModuleTarget = mix(qrLightTarget, hdr, qrDarkModule)',
  '_qrRawProgress * _qrRawProgress * (3 - 2 * _qrRawProgress)',
  '900ms cubic-bezier(.4, 0, .2, 1)'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required color/motion refinement was not applied: ${fragment}`);
  }
}

for (const forbidden of [
  'let qrDarkTargetLuma = mix(0.18, 0.105, qrFlatMix)',
  'let qrFoliageTargetLuma = mix(0.225, 0.12, qrFlatMix)',
  'let qrFlowerTargetLuma = mix(0.225, 0.105, qrFlowerFlat)',
  'colorScheme: _qrResolvedTheme'
]) {
  if (source.includes(forbidden)) {
    throw new Error(`Theme refinement left an unwanted abrupt/darkening path: ${forbidden}`);
  }
}

fs.writeFileSync(appFile, source);
console.log('Preserved seasonal/custom foliage colors and synchronized the UI/WebGPU theme transition.');
