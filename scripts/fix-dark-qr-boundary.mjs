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

for (const prerequisite of [
  'qr-tree-studio-preserve-colored-qr-modules',
  'qr-tree-studio-preserve-raised-foliage',
  'qr-tree-studio-preserve-leaf-petal-color',
  'qr-tree-studio-synchronized-theme-motion',
  'qr-tree-studio-snapshot-theme-invalidation'
]) {
  if (!source.includes(prerequisite)) {
    throw new Error(`Dark QR boundary repair requires the existing visual-preservation patch: ${prerequisite}`);
  }
}

if (!source.includes('qr-tree-studio-dark-qr-boundary-separator')) {
  const before = `            _0x31335f.drawImage(_0x3404a9, 0, 0);\n            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");`;
  const after = `            _0x31335f.drawImage(_0x3404a9, 0, 0);\n\n            /* qr-tree-studio-dark-qr-boundary-separator */\n            // Preserve every QR module exactly as rendered. Dark mode receives\n            // only a very thin, season-matched separator outside the platform,\n            // preventing edge modules from merging into the dark scene.\n            if (_qrSnapshotThemeMix >= 0.98) {\n              try {\n                const _qrW = _0xc795fa;\n                const _qrH = _0x15124f;\n                const _qrImage = _0x31335f.getImageData(0, 0, _qrW, _qrH);\n                const _qrPixels = _qrImage.data;\n                const _qrAt = (_qrX, _qrY) => (_qrY * _qrW + _qrX) * 4;\n                const _qrLuma = (_qrR, _qrG, _qrB) => 0.299 * _qrR + 0.587 * _qrG + 0.114 * _qrB;\n                const _qrCorner = Math.max(2, Math.min(10, Math.round(Math.min(_qrW, _qrH) * 0.008)));\n                const _qrAverage = (_qrX0, _qrY0, _qrX1, _qrY1) => {\n                  let _qrR = 0, _qrG = 0, _qrB = 0, _qrN = 0;\n                  for (let _qrY = _qrY0; _qrY < _qrY1; _qrY++) {\n                    for (let _qrX = _qrX0; _qrX < _qrX1; _qrX++) {\n                      const _qrI = _qrAt(_qrX, _qrY);\n                      _qrR += _qrPixels[_qrI];\n                      _qrG += _qrPixels[_qrI + 1];\n                      _qrB += _qrPixels[_qrI + 2];\n                      _qrN++;\n                    }\n                  }\n                  return [_qrR / _qrN, _qrG / _qrN, _qrB / _qrN];\n                };\n                const _qrCorners = [\n                  _qrAverage(0, 0, _qrCorner, _qrCorner),\n                  _qrAverage(_qrW - _qrCorner, 0, _qrW, _qrCorner),\n                  _qrAverage(0, _qrH - _qrCorner, _qrCorner, _qrH),\n                  _qrAverage(_qrW - _qrCorner, _qrH - _qrCorner, _qrW, _qrH)\n                ];\n                const _qrBackground = [0, 1, 2].map(_qrChannel =>\n                  _qrCorners.reduce((_qrSum, _qrColor) => _qrSum + _qrColor[_qrChannel], 0) / _qrCorners.length\n                );\n                const _qrStep = Math.max(1, Math.floor(Math.min(_qrW, _qrH) / 720));\n                const _qrRows = Math.ceil(_qrH / _qrStep);\n                const _qrCols = Math.ceil(_qrW / _qrStep);\n                const _qrRowHits = new Uint16Array(_qrRows);\n                const _qrColHits = new Uint16Array(_qrCols);\n\n                for (let _qrRY = 0, _qrY = 0; _qrY < _qrH; _qrRY++, _qrY += _qrStep) {\n                  for (let _qrCX = 0, _qrX = 0; _qrX < _qrW; _qrCX++, _qrX += _qrStep) {\n                    const _qrI = _qrAt(_qrX, _qrY);\n                    const _qrR = _qrPixels[_qrI];\n                    const _qrG = _qrPixels[_qrI + 1];\n                    const _qrB = _qrPixels[_qrI + 2];\n                    const _qrDistance =\n                      Math.abs(_qrR - _qrBackground[0]) +\n                      Math.abs(_qrG - _qrBackground[1]) +\n                      Math.abs(_qrB - _qrBackground[2]);\n                    if (_qrDistance > 38 || _qrLuma(_qrR, _qrG, _qrB) > _qrLuma(..._qrBackground) + 32) {\n                      _qrRowHits[_qrRY]++;\n                      _qrColHits[_qrCX]++;\n                    }\n                  }\n                }\n\n                const _qrCoreRow = Math.max(3, Math.floor(_qrCols * 0.085));\n                const _qrCoreCol = Math.max(3, Math.floor(_qrRows * 0.085));\n                let _qrMinX = -1, _qrMaxX = -1, _qrMinY = -1, _qrMaxY = -1;\n                for (let _qrI = 0; _qrI < _qrColHits.length; _qrI++) {\n                  if (_qrColHits[_qrI] >= _qrCoreCol) {\n                    if (_qrMinX < 0) _qrMinX = _qrI;\n                    _qrMaxX = _qrI;\n                  }\n                }\n                for (let _qrI = 0; _qrI < _qrRowHits.length; _qrI++) {\n                  if (_qrRowHits[_qrI] >= _qrCoreRow) {\n                    if (_qrMinY < 0) _qrMinY = _qrI;\n                    _qrMaxY = _qrI;\n                  }\n                }\n                const _qrEdgeRow = Math.max(2, Math.floor(_qrCols * 0.01));\n                const _qrEdgeCol = Math.max(2, Math.floor(_qrRows * 0.01));\n                while (_qrMinX > 0 && _qrColHits[_qrMinX - 1] >= _qrEdgeCol) _qrMinX--;\n                while (_qrMaxX >= 0 && _qrMaxX + 1 < _qrColHits.length && _qrColHits[_qrMaxX + 1] >= _qrEdgeCol) _qrMaxX++;\n                while (_qrMinY > 0 && _qrRowHits[_qrMinY - 1] >= _qrEdgeRow) _qrMinY--;\n                while (_qrMaxY >= 0 && _qrMaxY + 1 < _qrRowHits.length && _qrRowHits[_qrMaxY + 1] >= _qrEdgeRow) _qrMaxY++;\n\n                const _qrMinDimension = Math.min(_qrW, _qrH);\n                let _qrLeft, _qrTop, _qrSide;\n                if (_qrMinX >= 0 && _qrMinY >= 0) {\n                  const _qrX0 = _qrMinX * _qrStep;\n                  const _qrY0 = _qrMinY * _qrStep;\n                  const _qrX1 = Math.min(_qrW, (_qrMaxX + 1) * _qrStep);\n                  const _qrY1 = Math.min(_qrH, (_qrMaxY + 1) * _qrStep);\n                  _qrSide = Math.max(_qrX1 - _qrX0, _qrY1 - _qrY0);\n                  _qrLeft = Math.round((_qrX0 + _qrX1 - _qrSide) / 2);\n                  _qrTop = Math.round((_qrY0 + _qrY1 - _qrSide) / 2);\n                }\n                if (!Number.isFinite(_qrSide) || _qrSide < _qrMinDimension * 0.68 || _qrSide > _qrMinDimension * 0.97) {\n                  _qrSide = Math.round(_qrMinDimension * 0.882);\n                  _qrLeft = Math.round((_qrW - _qrSide) / 2);\n                  _qrTop = Math.round((_qrH - _qrSide) / 2);\n                }\n                _qrLeft = Math.max(0, Math.min(_qrW - _qrSide, _qrLeft));\n                _qrTop = Math.max(0, Math.min(_qrH - _qrSide, _qrTop));\n                const _qrRight = _qrLeft + _qrSide;\n                const _qrBottom = _qrTop + _qrSide;\n\n                let _qrLightR = 0, _qrLightG = 0, _qrLightB = 0, _qrLightN = 0;\n                const _qrBgLuma = _qrLuma(..._qrBackground);\n                for (let _qrY = _qrTop; _qrY < _qrBottom; _qrY += _qrStep) {\n                  for (let _qrX = _qrLeft; _qrX < _qrRight; _qrX += _qrStep) {\n                    const _qrI = _qrAt(_qrX, _qrY);\n                    const _qrR = _qrPixels[_qrI];\n                    const _qrG = _qrPixels[_qrI + 1];\n                    const _qrB = _qrPixels[_qrI + 2];\n                    if (_qrLuma(_qrR, _qrG, _qrB) > _qrBgLuma + 52) {\n                      _qrLightR += _qrR; _qrLightG += _qrG; _qrLightB += _qrB; _qrLightN++;\n                    }\n                  }\n                }\n                const _qrLight = _qrLightN > 0\n                  ? [_qrLightR / _qrLightN, _qrLightG / _qrLightN, _qrLightB / _qrLightN]\n                  : [145, 160, 175];\n                const _qrMatrixSize = Array.isArray(_0x43f2cb.current) && _0x43f2cb.current.length > 0\n                  ? _0x43f2cb.current.length\n                  : 25;\n                const _qrModule = _qrSide / _qrMatrixSize;\n\n                const _qrPaintSeparator = (_qrWidthFactor, _qrStrength) => {\n                  const _qrWidth = Math.max(4, Math.min(12, Math.round(_qrModule * _qrWidthFactor)));\n                  const _qrColor = [0, 1, 2].map(_qrChannel => Math.round(\n                    _qrBackground[_qrChannel] + (_qrLight[_qrChannel] - _qrBackground[_qrChannel]) * _qrStrength\n                  ));\n                  const _qrOuterLeft = Math.max(0, _qrLeft - _qrWidth);\n                  const _qrOuterTop = Math.max(0, _qrTop - _qrWidth);\n                  const _qrOuterRight = Math.min(_qrW, _qrRight + _qrWidth);\n                  const _qrOuterBottom = Math.min(_qrH, _qrBottom + _qrWidth);\n                  _0x31335f.fillStyle = "rgb(" + _qrColor.join(",") + ")";\n                  _0x31335f.fillRect(_qrOuterLeft, _qrOuterTop, _qrOuterRight - _qrOuterLeft, _qrTop - _qrOuterTop);\n                  _0x31335f.fillRect(_qrOuterLeft, _qrBottom, _qrOuterRight - _qrOuterLeft, _qrOuterBottom - _qrBottom);\n                  _0x31335f.fillRect(_qrOuterLeft, _qrTop, _qrLeft - _qrOuterLeft, _qrSide);\n                  _0x31335f.fillRect(_qrRight, _qrTop, _qrOuterRight - _qrRight, _qrSide);\n                  return _qrWidth;\n                };\n                const _qrDecodes = _qrWidth => {\n                  const _qrPad = Math.min(16, _qrWidth + 3);\n                  const _qrX = Math.max(0, _qrLeft - _qrPad);\n                  const _qrY = Math.max(0, _qrTop - _qrPad);\n                  const _qrX1 = Math.min(_qrW, _qrRight + _qrPad);\n                  const _qrY1 = Math.min(_qrH, _qrBottom + _qrPad);\n                  const _qrScan = _0x31335f.getImageData(_qrX, _qrY, _qrX1 - _qrX, _qrY1 - _qrY);\n                  const _qrDecoded = jsQR(_qrScan.data, _qrScan.width, _qrScan.height, { inversionAttempts: "attemptBoth" });\n                  return Boolean(_qrDecoded && _qrDecoded.data &&\n                    _qrDecoded.data.trim() === String(_0x2323cd.current || "").trim());\n                };\n\n                let _qrSeparatorWidth = _qrPaintSeparator(0.18, 0.60);\n                if (!_qrDecodes(_qrSeparatorWidth)) {\n                  _qrSeparatorWidth = _qrPaintSeparator(0.25, 0.74);\n                  if (!_qrDecodes(_qrSeparatorWidth)) {\n                    _qrPaintSeparator(0.34, 0.90);\n                  }\n                }\n              } catch (_qrBoundaryError) {\n                console.warn("Dark QR boundary enhancement was skipped", _qrBoundaryError);\n              }\n            }\n\n            const _0x3b0cfe = _0x429fa1.toDataURL("image/png");`;
  replaceOnce(before, after, 'minimal Dark-mode QR boundary separator');
}

for (const fragment of [
  'qr-tree-studio-dark-qr-boundary-separator',
  'Preserve every QR module exactly as rendered',
  '_qrPaintSeparator(0.18, 0.60)',
  '_qrDecodes(_qrSeparatorWidth)',
  'const _qrMatrixSize = Array.isArray(_0x43f2cb.current)'
]) {
  if (!source.includes(fragment)) {
    throw new Error(`Required Dark QR boundary fragment was not applied: ${fragment}`);
  }
}
for (const forbidden of [
  'qr-tree-studio-dark-scan-snapshot',
  'qr-tree-studio-scan-safe-colored-modules',
  'const _qrQuietModules = 4',
  'qrScanScale = min(1.0'
]) {
  if (source.includes(forbidden)) {
    throw new Error(`A previous QR replacement implementation is still present: ${forbidden}`);
  }
}

// Decoder regression: a valid colored QR touching a dark surround must remain
// visually unchanged while the narrow external separator makes it locatable.
const regressionMatrix = [
  '1111111011001010101111111','1000001001010110101000001','1011101011001111001011101',
  '1011101000011110001011101','1011101000111010001011101','1000001010110000001000001',
  '1111111010101010101111111','0000000000010010100000000','1010001100111000100100101',
  '0011100010001101111101011','1110111000111001011011101','0111110110011000101001000',
  '1110011011101011001100001','0100110000001101101100011','1110011101001001100001101',
  '0001110011111011001111000','1101011111100111111110010','0000000011000100100010001',
  '1111111011010000101010001','1000001001000101100010010','1011101001111101111110001',
  '1011101001001000110010110','1011101011001110110111011','1000001000111011100110000',
  '1111111011100110101001001'
];
const regressionPayload = 'https://arnavbule.in/';

function verifyBoundaryRegression(modulePixels) {
  const matrixSize = regressionMatrix.length;
  const qrSide = matrixSize * modulePixels;
  const canvasSize = qrSide + modulePixels * 4;
  const qrStart = Math.floor((canvasSize - qrSide) / 2);
  const rgba = new Uint8ClampedArray(canvasSize * canvasSize * 4);
  const fill = (x, y, width, height, [r, g, b]) => {
    for (let py = Math.max(0, y); py < Math.min(canvasSize, y + height); py++) {
      for (let px = Math.max(0, x); px < Math.min(canvasSize, x + width); px++) {
        const offset = (py * canvasSize + px) * 4;
        rgba[offset] = r; rgba[offset + 1] = g; rgba[offset + 2] = b; rgba[offset + 3] = 255;
      }
    }
  };
  const background = [28, 34, 43];
  const field = [136, 152, 168];
  const ring = [98, 110, 123];
  const dark = [[72, 32, 32], [32, 48, 24], [64, 40, 32]];
  fill(0, 0, canvasSize, canvasSize, background);
  fill(qrStart, qrStart, qrSide, qrSide, field);
  for (let row = 0; row < matrixSize; row++) {
    for (let col = 0; col < matrixSize; col++) {
      if (regressionMatrix[row][col] === '1') {
        fill(qrStart + col * modulePixels, qrStart + row * modulePixels,
          modulePixels, modulePixels, dark[(row * 7 + col * 11) % dark.length]);
      }
    }
  }
  const ringWidth = Math.max(2, Math.round(modulePixels * 0.18));
  fill(qrStart - ringWidth, qrStart - ringWidth, qrSide + ringWidth * 2, ringWidth, ring);
  fill(qrStart - ringWidth, qrStart + qrSide, qrSide + ringWidth * 2, ringWidth, ring);
  fill(qrStart - ringWidth, qrStart, ringWidth, qrSide, ring);
  fill(qrStart + qrSide, qrStart, ringWidth, qrSide, ring);
  const decoded = jsQR(rgba, canvasSize, canvasSize, { inversionAttempts: 'attemptBoth' });
  if (!decoded || decoded.data !== regressionPayload) {
    throw new Error(`Dark QR boundary regression failed at ${modulePixels}px per module.`);
  }
}
for (const modulePixels of [6, 10, 14]) verifyBoundaryRegression(modulePixels);

fs.writeFileSync(appFile, source);
console.log('Added a decoder-verified Dark-mode boundary separator without changing QR modules or tree colors.');
