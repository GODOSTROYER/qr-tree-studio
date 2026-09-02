import fs from 'node:fs';
import path from 'node:path';
import jsQR from 'jsqr';

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

if (!source.includes('qr-tree-studio-preserve-colored-qr-modules') ||
    !source.includes('qr-tree-studio-snapshot-theme-invalidation') ||
    !source.includes('qr-tree-studio-synchronized-theme-motion')) {
  throw new Error('The color-preservation and synchronized-theme patches must run before scan hardening.');
}

// Keep the 3D tree color completely theme-independent. Only the fully flattened
// QR representation may gently lower a bright selected hue, and only as much as
// necessary to retain a reliable dark-on-light module relationship.
if (!source.includes('qr-tree-studio-scan-safe-colored-modules')) {
  const before = `      // qr-tree-studio-preserve-colored-qr-modules\\n      // Logical colored modules retain the exact seasonal/custom shaded color\\n      // used by Light mode. Dark mode changes only the pale QR field around\\n      // them, so palette identity remains stable throughout the transition.\\n      let qrModuleTarget = mix(qrLightTarget, hdr, qrDarkModule);\\n      hdr = mix(hdr, qrModuleTarget, qrThemeMix);\\n`;
  const after = `      // qr-tree-studio-preserve-colored-qr-modules\\n      // qr-tree-studio-scan-safe-colored-modules\\n      // The tree and raised foliage keep their exact Light-mode color. Only at\\n      // the flattened QR endpoint do bright module colors move toward the\\n      // nearest darker variant of the same hue for scanner-safe contrast.\\n      var qrScanBase = vec3f(0.88, 0.36, 0.46);\\n      if (season > 0.5 && season < 1.5) {\\n        qrScanBase = vec3f(0.10, 0.30, 0.06);\\n      } else if (season > 1.5 && season < 2.5) {\\n        qrScanBase = vec3f(0.86, 0.32, 0.08);\\n      } else if (season > 2.5) {\\n        qrScanBase = vec3f(0.19, 0.36, 0.29);\\n      }\\n      if (customStr > 0.01) {\\n        qrScanBase = vec3f(uniforms.customR, uniforms.customG, uniforms.customB);\\n      }\\n      let qrScanLuma = max(dot(qrScanBase, qrLumaWeights), 0.01);\\n      let qrScanScale = min(1.0, 0.26 / qrScanLuma);\\n      let qrScanColor = clamp(qrScanBase * qrScanScale, vec3f(0.02), vec3f(0.72));\\n      let qrColoredModule = mix(hdr, qrScanColor, qrFlatMix);\\n      let qrModuleTarget = mix(qrLightTarget, qrColoredModule, qrDarkModule);\\n      hdr = mix(hdr, qrModuleTarget, qrThemeMix);\\n`;
  replaceOnce(before, after, 'scanner-safe colored QR modules');
}

// The artistic 3D platform remains graphite in Dark mode. As it settles into
// the 2D QR, the logical light field becomes a muted light slate—not white—so
// cameras have enough luminance separation from every supported leaf color.
const lightFieldReplacements = [
  ['var qrGraphiteFlat = vec3f(0.55, 0.56, 0.58);\\n', 'var qrGraphiteFlat = vec3f(0.82, 0.85, 0.88);\\n'],
  ['qrGraphiteFlat = vec3f(0.56, 0.53, 0.58);\\n', 'qrGraphiteFlat = vec3f(0.83, 0.82, 0.87);\\n'],
  ['qrGraphiteFlat = vec3f(0.52, 0.57, 0.54);\\n', 'qrGraphiteFlat = vec3f(0.80, 0.85, 0.82);\\n'],
  ['qrGraphiteFlat = vec3f(0.58, 0.54, 0.49);\\n', 'qrGraphiteFlat = vec3f(0.86, 0.83, 0.79);\\n'],
  ['qrGraphiteFlat = vec3f(0.51, 0.56, 0.61);\\n', 'qrGraphiteFlat = vec3f(0.80, 0.84, 0.88);\\n']
];
for (const [before, after] of lightFieldReplacements) {
  replaceOnce(before, after, 'scan-safe flattened QR light field');
}

// Replace the Dark-theme WebGPU screenshot with a deterministic render of the
// already-generated boolean QR matrix. This does not encode or alter data: it
// paints the exact matrix with integer modules and a true four-module quiet zone.
// Light-theme snapshots keep the original artistic top-down capture.
if (!source.includes('qr-tree-studio-dark-scan-snapshot')) {
  const before = `          const _0x429fa1 = document.createElement("canvas");\n          _0x429fa1.width = _0xc795fa;\n          _0x429fa1.height = _0x15124f;\n          const _0x31335f = _0x429fa1.getContext("2d");\n          if (_0x31335f) {\n            _0x31335f.drawImage(_0x3404a9, 0, 0);\n            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");\n            _0x1ddb2b.current = _0x3b0cfe;\n            _0x1e3edc?.current?.(_0x3b0cfe);\n          }`;
  const after = `          const _0x429fa1 = document.createElement("canvas");\n          _0x429fa1.width = _0xc795fa;\n          _0x429fa1.height = _0x15124f;\n          const _0x31335f = _0x429fa1.getContext("2d", { willReadFrequently: true });\n          if (_0x31335f) {\n            /* qr-tree-studio-dark-scan-snapshot */\n            const _qrDarkSnapshot = _qrSnapshotThemeMix >= 0.98;\n            const _qrSnapshotMatrix = _0x43f2cb.current;\n            if (_qrDarkSnapshot && Array.isArray(_qrSnapshotMatrix) && _qrSnapshotMatrix.length > 0) {\n              const _qrQuietModules = 4;\n              const _qrMatrixSize = _qrSnapshotMatrix.length;\n              const _qrTotalModules = _qrMatrixSize + _qrQuietModules * 2;\n              const _qrCellSize = Math.max(1, Math.floor(Math.min(_0xc795fa, _0x15124f) * 0.92 / _qrTotalModules));\n              const _qrCardSize = _qrCellSize * _qrTotalModules;\n              const _qrCardX = Math.floor((_0xc795fa - _qrCardSize) / 2);\n              const _qrCardY = Math.floor((_0x15124f - _qrCardSize) / 2);\n              const _qrSeason = Math.max(0, Math.min(3, Math.round(_0x45ded0.current || 0)));\n              const _qrOuterFields = [[21, 19, 27], [13, 24, 19], [27, 20, 14], [14, 23, 35]];\n              const _qrLightFields = [[212, 209, 222], [204, 217, 209], [219, 212, 201], [204, 214, 224]];\n              const _qrSeasonColors = [[224, 92, 117], [26, 77, 15], [219, 82, 20], [48, 92, 74]];\n              const _qrCustomColor = _0x2728d7.current;\n              const _qrBaseColor = _qrCustomColor[3] > 0.01\n                ? _qrCustomColor.slice(0, 3).map(_qrValue => Math.round(Math.max(0, Math.min(1, _qrValue)) * 255))\n                : _qrSeasonColors[_qrSeason];\n              const _qrLightColor = _qrLightFields[_qrSeason];\n              const _qrLinearChannel = _qrValue => {\n                const _qrChannel = _qrValue / 255;\n                return _qrChannel <= 0.04045 ? _qrChannel / 12.92 : ((_qrChannel + 0.055) / 1.055) ** 2.4;\n              };\n              const _qrRelativeLuminance = _qrColor =>\n                0.2126 * _qrLinearChannel(_qrColor[0]) +\n                0.7152 * _qrLinearChannel(_qrColor[1]) +\n                0.0722 * _qrLinearChannel(_qrColor[2]);\n              const _qrContrast = (_qrFirst, _qrSecond) => {\n                const _qrA = _qrRelativeLuminance(_qrFirst);\n                const _qrB = _qrRelativeLuminance(_qrSecond);\n                return (Math.max(_qrA, _qrB) + 0.05) / (Math.min(_qrA, _qrB) + 0.05);\n              };\n              const _qrFitModuleColor = (_qrColor, _qrField, _qrTarget = 5.5) => {\n                if (_qrContrast(_qrColor, _qrField) >= _qrTarget) return _qrColor;\n                let _qrLow = 0;\n                let _qrHigh = 1;\n                for (let _qrIteration = 0; _qrIteration < 16; _qrIteration++) {\n                  const _qrScale = (_qrLow + _qrHigh) / 2;\n                  const _qrCandidate = _qrColor.map(_qrValue => Math.round(_qrValue * _qrScale));\n                  if (_qrContrast(_qrCandidate, _qrField) >= _qrTarget) _qrLow = _qrScale;\n                  else _qrHigh = _qrScale;\n                }\n                return _qrColor.map(_qrValue => Math.round(_qrValue * _qrLow));\n              };\n              const _qrModuleColor = _qrFitModuleColor(_qrBaseColor, _qrLightColor);\n              const _qrCss = _qrColor => "rgb(" + _qrColor.join(",") + ")";\n              const _qrPaint = _qrDarkColor => {\n                _0x31335f.imageSmoothingEnabled = false;\n                _0x31335f.fillStyle = _qrCss(_qrOuterFields[_qrSeason]);\n                _0x31335f.fillRect(0, 0, _0xc795fa, _0x15124f);\n                _0x31335f.fillStyle = _qrCss(_qrLightColor);\n                _0x31335f.fillRect(_qrCardX, _qrCardY, _qrCardSize, _qrCardSize);\n                _0x31335f.fillStyle = _qrCss(_qrDarkColor);\n                for (let _qrRow = 0; _qrRow < _qrMatrixSize; _qrRow++) {\n                  for (let _qrCol = 0; _qrCol < _qrMatrixSize; _qrCol++) {\n                    if (_qrSnapshotMatrix[_qrRow]?.[_qrCol]) {\n                      _0x31335f.fillRect(\n                        _qrCardX + (_qrCol + _qrQuietModules) * _qrCellSize,\n                        _qrCardY + (_qrRow + _qrQuietModules) * _qrCellSize,\n                        _qrCellSize,\n                        _qrCellSize\n                      );\n                    }\n                  }\n                }\n              };\n              _qrPaint(_qrModuleColor);\n              const _qrCardPixels = _0x31335f.getImageData(_qrCardX, _qrCardY, _qrCardSize, _qrCardSize);\n              const _qrDecoded = jsQR(_qrCardPixels.data, _qrCardSize, _qrCardSize, { inversionAttempts: "dontInvert" });\n              if (!_qrDecoded || _qrDecoded.data !== _0x2323cd.current) {\n                // A deterministic neutral fallback takes priority over decoration.\n                _qrPaint([24, 29, 35]);\n              }\n            } else {\n              _0x31335f.drawImage(_0x3404a9, 0, 0);\n            }\n            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");\n            _0x1ddb2b.current = _0x3b0cfe;\n            _0x1e3edc?.current?.(_0x3b0cfe);\n          }`;
  replaceOnce(before, after, 'deterministic Dark-theme QR snapshot');
}

const requiredFragments = [
  'qr-tree-studio-scan-safe-colored-modules',
  'qr-tree-studio-dark-scan-snapshot',
  'const _qrQuietModules = 4',
  'const _qrDecoded = jsQR',
  'qrScanScale = min(1.0, 0.26 / qrScanLuma)',
  'qrGraphiteFlat = vec3f(0.80, 0.84, 0.88)'
];
for (const fragment of requiredFragments) {
  if (!source.includes(fragment)) {
    throw new Error(`Required dark QR scan fragment was not applied: ${fragment}`);
  }
}

// Build-time regression: render the same known QR matrix through each supported
// color family and require jsQR to recover the exact payload. This exercises the
// quiet-zone, integer-module, contrast-fitting, and fallback assumptions.
const regressionMatrix = [
  '1111111001111100001111111',
  '1000001000011111101000001',
  '1011101011111001101011101',
  '1010101011010111001010101',
  '1011101010001100101011101',
  '1000001011111001001000001',
  '1111111010101010101111111',
  '0000000011011011100000000',
  '1011111000001110001111100',
  '1010100011000100110100010',
  '1000001110001111101101011',
  '1110110111010001100000001',
  '1000101101011101111010111',
  '1101110001000100100101010',
  '1000101011111111010111011',
  '1000110010110010000110001',
  '1011101001010001111110100',
  '0000000010001101100011000',
  '1111111001100110101010111',
  '1000001010001100100011011',
  '1011101011001011111110111',
  '1010101010000001111011111',
  '1011101011111000000001101',
  '1000001001110010101111001',
  '1111111011010000011111111'
];
const regressionColors = [
  [224, 92, 117],
  [26, 77, 15],
  [219, 82, 20],
  [48, 92, 74],
  [148, 77, 209],
  [242, 46, 38],
  [242, 173, 5],
  [56, 140, 245],
  [222, 230, 232]
];
const regressionLight = [204, 214, 224];
const linearChannel = value => {
  const channel = value / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
};
const relativeLuminance = color =>
  0.2126 * linearChannel(color[0]) +
  0.7152 * linearChannel(color[1]) +
  0.0722 * linearChannel(color[2]);
const contrast = (first, second) => {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const fitColor = color => {
  if (contrast(color, regressionLight) >= 5.5) return color;
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 16; iteration++) {
    const scale = (low + high) / 2;
    const candidate = color.map(value => Math.round(value * scale));
    if (contrast(candidate, regressionLight) >= 5.5) low = scale;
    else high = scale;
  }
  return color.map(value => Math.round(value * low));
};
const renderRegression = moduleColor => {
  const quiet = 4;
  const cell = 8;
  const matrixSize = regressionMatrix.length;
  const side = (matrixSize + quiet * 2) * cell;
  const pixels = new Uint8ClampedArray(side * side * 4);
  const paintPixel = (x, y, color) => {
    const index = (y * side + x) * 4;
    pixels[index] = color[0];
    pixels[index + 1] = color[1];
    pixels[index + 2] = color[2];
    pixels[index + 3] = 255;
  };
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) paintPixel(x, y, regressionLight);
  }
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (regressionMatrix[row][col] !== '1') continue;
      for (let py = 0; py < cell; py++) {
        for (let px = 0; px < cell; px++) {
          paintPixel((col + quiet) * cell + px, (row + quiet) * cell + py, moduleColor);
        }
      }
    }
  }
  return { pixels, side };
};
for (const baseColor of regressionColors) {
  const fittedColor = fitColor(baseColor);
  const { pixels, side } = renderRegression(fittedColor);
  const decoded = jsQR(pixels, side, side, { inversionAttempts: 'dontInvert' });
  if (!decoded || decoded.data !== 'https://arnavbule.in/') {
    throw new Error(`Dark QR scan regression failed for color ${baseColor.join(',')}.`);
  }
}

fs.writeFileSync(appFile, source);
console.log('Added a scan-safe Dark QR snapshot with exact matrix geometry, a four-module quiet zone, and minimally adjusted same-hue modules.');
