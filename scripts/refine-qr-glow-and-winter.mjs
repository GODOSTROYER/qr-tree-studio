import fs from 'node:fs';
import path from 'node:path';

const appFile = path.resolve('node_modules/qr-tree-engine/src/main.jsx');
const themeCssFile = path.resolve('src/theme.css');

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
  'qr-tree-studio-dark-qr-quiet-halo',
  'qr-tree-studio-deferred-color-scheme'
]) {
  if (!source.includes(prerequisite)) {
    throw new Error(`QR glow and winter refinement requires an earlier patch: ${prerequisite}`);
  }
}

// This script repaints materials, retimes the theme transition, moves the
// snapshot encode off the main thread and adds one decorative overlay. It must
// never touch payload encoding, module placement or block geometry.
const matrixSourceBefore = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation');
const geometrySourceBefore = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry');

// ---------------------------------------------------------------------------
// 1. Winter QR top faces
// The block fragment shader only applied its winter override to side faces, so
// the flattened top-down QR still showed spring-pink canopy modules and bright
// grass-green corners in Winter. Both top-face branches now honour the season.
// ---------------------------------------------------------------------------
replaceOnce(
  `      let finalEdge = mix(edgeDarken, 1.0, progress);\\n      albedo = cherryColor * topWarmTint * canopyAO * finalEdge;\\n`,
  `      let finalEdge = mix(edgeDarken, 1.0, progress);\\n      // qr-tree-studio-winter-qr-top-faces\\n      if (season > 2.5) {\\n        let winterPineTop = mix(vec3f(0.10, 0.22, 0.18), vec3f(0.26, 0.43, 0.36), noise1);\\n        let winterSnowTop = mix(vec3f(0.78, 0.86, 0.91), vec3f(0.91, 0.95, 0.97), noise2);\\n        let snowMaskTop = smoothstep(0.70, 0.98, noise2);\\n        cherryColor = mix(winterPineTop, winterSnowTop, snowMaskTop * 0.35);\\n        if (customStr > 0.01) {\\n          let customTop = vec3f(uniforms.customR, uniforms.customG, uniforms.customB);\\n          cherryColor = mix(mix(customTop * 0.72, customTop * 1.04, noise1), winterSnowTop, snowMaskTop * 0.20);\\n        }\\n      }\\n      albedo = cherryColor * topWarmTint * canopyAO * finalEdge;\\n`,
  'winter canopy top faces'
);

replaceOnce(
  `      let shift = (noise2 - 0.5) * 0.2;\\n      grassColor = grassColor * (1.0 + shift);\\n      albedo = grassColor * topWarmTint;\\n`,
  `      let shift = (noise2 - 0.5) * 0.2;\\n      grassColor = grassColor * (1.0 + shift);\\n      // qr-tree-studio-winter-qr-top-faces\\n      if (season > 2.5) {\\n        let winterGrassTop = mix(vec3f(0.12, 0.26, 0.20), vec3f(0.24, 0.40, 0.34), noise1);\\n        let winterFrostTop = vec3f(0.80, 0.87, 0.91);\\n        grassColor = mix(winterGrassTop, winterFrostTop, smoothstep(0.70, 0.98, noise2) * 0.30);\\n      }\\n      albedo = grassColor * topWarmTint;\\n`,
  'winter grass top faces'
);

// ---------------------------------------------------------------------------
// 2. Faster, smoother theme transition
// ---------------------------------------------------------------------------
replaceOnce(
  '    const _qrThemeDuration = 900;',
  '    /* qr-tree-studio-fast-theme-motion */\n    const _qrThemeDuration = 520;',
  'shortened theme transition duration'
);

replaceOnce(
  '        document.documentElement.style.colorScheme = _qrPendingColorScheme;\n      }\n    }, 900);',
  '        document.documentElement.style.colorScheme = _qrPendingColorScheme;\n      }\n    }, 520);',
  'deferred color scheme timing'
);

for (const [before, after] of [
  ['900ms cubic-bezier(.4, 0, .2, 1)', '520ms cubic-bezier(.4, 0, .2, 1)'],
  ['900ms cubic-bezier(.22, 1, .36, 1)', '520ms cubic-bezier(.22, 1, .36, 1)']
]) {
  source = source.split(before).join(after);
}

// ---------------------------------------------------------------------------
// 3. Snapshot encoding off the main thread
// toDataURL encodes a multi-megapixel PNG synchronously, at the exact moment
// the theme transition settles. toBlob does the same work asynchronously.
// ---------------------------------------------------------------------------
replaceOnce(
  '        let _qrLastSnapshotTheme = -1;\n        const _0x318264 = () => {',
  '        let _qrLastSnapshotTheme = -1;\n        /* qr-tree-studio-async-snapshot */\n        let _qrSnapshotSeq = 0;\n        let _qrSnapshotObjectUrl = "";\n        const _0x318264 = () => {',
  'async snapshot bookkeeping'
);

replaceOnce(
  `            _0x31335f.drawImage(_0x3404a9, 0, 0);\n            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");\n            _0x1ddb2b.current = _0x3b0cfe;\n            _0x1e3edc?.current?.(_0x3b0cfe);`,
  `            _0x31335f.drawImage(_0x3404a9, 0, 0);\n            // Publish an object URL for display immediately, then produce the\n            // data URL off the critical path. Both consumers already accept\n            // either form: the download anchor and the share/copy helper.\n            const _qrSnapshotId = ++_qrSnapshotSeq;\n            const _qrSnapshotPayload = _0x2323cd.current;\n            const _qrSnapshotIsStale = () =>\n              _qrSnapshotId !== _qrSnapshotSeq ||\n              _0x4e7fe7.current !== _0x2323cd.current ||\n              _qrSnapshotPayload !== _0x2323cd.current;\n            _0x429fa1.toBlob(_qrBlob => {\n              if (!_qrBlob || _qrSnapshotIsStale()) {\n                return;\n              }\n              const _qrPreviousObjectUrl = _qrSnapshotObjectUrl;\n              _qrSnapshotObjectUrl = URL.createObjectURL(_qrBlob);\n              _0x1ddb2b.current = _qrSnapshotObjectUrl;\n              _0x1e3edc?.current?.(_qrSnapshotObjectUrl);\n              if (_qrPreviousObjectUrl) {\n                // Revoke only after the commit that swaps the <img> src.\n                setTimeout(() => URL.revokeObjectURL(_qrPreviousObjectUrl), 0);\n              }\n              const _qrReader = new FileReader();\n              _qrReader.onload = () => {\n                if (_qrSnapshotIsStale() || typeof _qrReader.result !== "string") {\n                  return;\n                }\n                _0x1ddb2b.current = _qrReader.result;\n              };\n              _qrReader.readAsDataURL(_qrBlob);\n            }, "image/png");`,
  'asynchronous snapshot encoding'
);

// ---------------------------------------------------------------------------
// 4. The WebGPU halo grows with the theme and breathes
// The snapshot is rendered with time 0 and themeMix 1, so the captured PNG is
// byte-identical to before; only the live canvas gains the motion.
// ---------------------------------------------------------------------------
replaceOnce(
  `  let edgeMix = 1.0 - smoothstep(hold, hold + feather, outside);\\n  let themeMix = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let flatMix = smoothstep(0.85, 1.0, uniforms.progress);\\n`,
  `  // qr-tree-studio-halo-motion\\n  let themeMix = smoothstep(0.0, 1.0, uniforms.themeMix);\\n  let flatMix = smoothstep(0.85, 1.0, uniforms.progress);\\n  let breathe = 1.0 + 0.05 * sin(uniforms.time * 1.1);\\n  let holdReach = hold * themeMix;\\n  let fullReach = (hold + feather) * themeMix * breathe;\\n  let edgeMix = 1.0 - smoothstep(holdReach, max(holdReach + 0.05, fullReach), outside);\\n  let haloFade = smoothstep(0.0, 0.30, themeMix);\\n`,
  'halo growth and breathing'
);

replaceOnce(
  `  return vec4f(field, edgeMix * themeMix * flatMix);\\n`,
  `  return vec4f(field, edgeMix * haloFade * flatMix);\\n`,
  'halo fade-in coupling'
);

// ---------------------------------------------------------------------------
// 5. DOM "living glow" over the displayed snapshot
// The snapshot is a static PNG, so the halo baked into it cannot animate. One
// absolutely positioned, pointer-events-none box whose footprint matches the
// platform exactly reproduces the halo outside it with a box-shadow. The
// interior stays transparent, so no QR module is ever covered.
// ---------------------------------------------------------------------------
if (!source.includes('qr-tree-studio-living-glow')) {
  replaceOnce(
    '  const _0x23bdbd = _0x446d01 && _0x52efb9 && !!_0x1f990f;',
    `  const _0x23bdbd = _0x446d01 && _0x52efb9 && !!_0x1f990f;\n  /* qr-tree-studio-living-glow */\n  const _qrGlowGridSize = (0, m.useMemo)(() => {\n    try {\n      const _qrMatrix = ee(_0x16eae2);\n      return Array.isArray(_qrMatrix) ? _qrMatrix.length : 0;\n    } catch {\n      return 0;\n    }\n  }, [_0x16eae2]);\n  const _qrGlowBox = (0, m.useMemo)(() => {\n    const _qrModules = _qrGlowGridSize;\n    const _qrWidth = _0x1bb750.width;\n    const _qrHeight = _0x1bb750.height;\n    if (!_qrModules || !_qrWidth || !_qrHeight) {\n      return null;\n    }\n    // Mirrors the block vertex shader at progress 1 exactly: block centers run\n    // from -halfGrid to halfGrid - blockSize, each cube spanning +/- half a\n    // module, then the shared camera scale and scene offsets.\n    const _qrBlockSize = 0.0245;\n    const _qrAspect = _qrWidth / _qrHeight;\n    const _qrViewScale = 46.4 / _qrModules * (_qrAspect < 0.8 ? 1.2 : 1);\n    const _qrScaleX = _qrViewScale / Math.max(_qrAspect, 1);\n    const _qrScaleY = _qrViewScale / Math.max(1 / _qrAspect, 1);\n    const _qrHalfGrid = _qrModules * _qrBlockSize / 2;\n    const _qrLow = -_qrHalfGrid - _qrBlockSize / 2;\n    const _qrHigh = _qrHalfGrid - _qrBlockSize / 2;\n    const _qrLeft = (1 + (_qrLow + 0.015) * _qrScaleX) / 2 * _qrWidth;\n    const _qrRight = (1 + (_qrHigh + 0.015) * _qrScaleX) / 2 * _qrWidth;\n    const _qrTop = (1 - (_qrHigh + 0.08) * _qrScaleY) / 2 * _qrHeight;\n    const _qrBottom = (1 - (_qrLow + 0.08) * _qrScaleY) / 2 * _qrHeight;\n    return {\n      left: _qrLeft,\n      top: _qrTop,\n      width: _qrRight - _qrLeft,\n      height: _qrBottom - _qrTop,\n      modulePx: (_qrRight - _qrLeft) / _qrModules\n    };\n  }, [_qrGlowGridSize, _0x1bb750.width, _0x1bb750.height]);\n  const _qrGlowField = _qrDarkLightFields[_0x153546] || _qrDarkLightFields[1];\n  const _qrGlowColor = "rgb(" + Math.round(_qrGlowField[0] * 255) + ", " + Math.round(_qrGlowField[1] * 255) + ", " + Math.round(_qrGlowField[2] * 255) + ")";\n  const _qrGlowOn = _qrResolvedTheme === "dark" && _0x446d01 && _0x52efb9;`,
    'living glow geometry'
  );

  replaceOnce(
    `both" /* qr-tree-studio-snapshot-theme-fade */\n        }} />}`,
    `both" /* qr-tree-studio-snapshot-theme-fade */\n        }} />}{_0x446d01 && _qrGlowBox && <div data-qr-living-glow="true" aria-hidden="true" style={{\n          position: "absolute",\n          left: _qrGlowBox.left,\n          top: _qrGlowBox.top,\n          width: _qrGlowBox.width,\n          height: _qrGlowBox.height,\n          borderRadius: _qrGlowBox.modulePx * 0.6,\n          pointerEvents: "none",\n          zIndex: 2,\n          boxShadow: "0 0 " + _qrGlowBox.modulePx * 3.5 + "px " + _qrGlowBox.modulePx * 1.5 + "px " + _qrGlowColor,\n          opacity: _qrGlowOn ? 1 : 0,\n          transition: "opacity 520ms cubic-bezier(.4, 0, .2, 1)",\n          animation: _qrGlowOn ? "qrLivingGlow 4.6s ease-in-out infinite" : "none",\n          willChange: "transform, opacity"\n        }} />}`,
    'living glow overlay'
  );
}

const matrixSourceAfter = extractBetween(source, 'function ee(', '\nfunction ae(', 'QR matrix generation after refinement');
const geometrySourceAfter = extractBetween(source, 'function ae(', '\nfunction ie(', 'QR block geometry after refinement');
if (matrixSourceAfter !== matrixSourceBefore) {
  throw new Error('QR matrix generation changed while refining glow and winter materials.');
}
if (geometrySourceAfter !== geometrySourceBefore) {
  throw new Error('QR block geometry changed while refining glow and winter materials.');
}

const requiredFragments = [
  'qr-tree-studio-winter-qr-top-faces',
  'qr-tree-studio-fast-theme-motion',
  'qr-tree-studio-async-snapshot',
  'qr-tree-studio-halo-motion',
  'qr-tree-studio-living-glow',
  'const _qrThemeDuration = 520;',
  'let winterPineTop = mix(vec3f(0.10, 0.22, 0.18)',
  'let winterGrassTop = mix(vec3f(0.12, 0.26, 0.20)',
  'let haloFade = smoothstep(0.0, 0.30, themeMix)',
  'let hold = 1.5',
  'o.local = localPos.xz',
  '_0x429fa1.toBlob(_qrBlob => {',
  'data-qr-living-glow="true"',
  'qrLivingGlow 4.6s ease-in-out infinite'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required glow/winter refinement was not applied: ${fragment}`);
  }
}

for (const forbidden of [
  'const _qrThemeDuration = 900;',
  '900ms cubic-bezier(.4, 0, .2, 1)',
  '_0x429fa1.toDataURL("image/png")',
  'edgeMix * themeMix * flatMix',
  'let edgeMix = 1.0 - smoothstep(hold, hold + feather, outside)',
  '    }, 900);'
]) {
  if (source.includes(forbidden)) {
    throw new Error(`A superseded slow/synchronous path is still present: ${forbidden}`);
  }
}

// The winter override must apply to exactly the two top-face branches.
const winterTopFaceCount = source.split('qr-tree-studio-winter-qr-top-faces').length - 1;
if (winterTopFaceCount !== 2) {
  throw new Error(`Expected 2 winter top-face overrides, found ${winterTopFaceCount}.`);
}

// The stylesheet carries the glow keyframes and must not animate filter on a
// full-viewport image: animated blur is a mobile jank source.
if (!fs.existsSync(themeCssFile)) {
  throw new Error(`Theme stylesheet not found: ${themeCssFile}`);
}
const themeCss = fs.readFileSync(themeCssFile, 'utf8');
if (themeCss.includes('filter: blur(1.5px)') || themeCss.includes('filter: blur(')) {
  throw new Error('src/theme.css still animates filter: blur on the snapshot image.');
}
for (const cssFragment of ['@keyframes qrLivingGlow', 'transform: scale(1.035)', '520ms cubic-bezier']) {
  if (!themeCss.includes(cssFragment)) {
    throw new Error(`src/theme.css is missing the required rule: ${cssFragment}`);
  }
}
if (themeCss.includes('900ms')) {
  throw new Error('src/theme.css still uses the old 900ms theme timing.');
}

fs.writeFileSync(appFile, source);
console.log('Fixed Winter QR top faces, shortened the theme transition, moved snapshot encoding off the main thread, and added the breathing QR glow.');
