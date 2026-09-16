import QRCode from "qrcode";

const ALOO_BLUE = "#1690F5";
const DARK = "#111111";

function esc(v: string) {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    "Z",
  ].join(" ");
}

function isFinderArea(row: number, col: number, size: number) {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col >= size - 7;
  const inBottomLeft = row >= size - 7 && col < 7;
  return inTopLeft || inTopRight || inBottomLeft;
}

export function generateStyledQrSvg(text: string, label?: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const marginModules = 3;
  const moduleSize = 10;
  const total = (size + marginModules * 2) * moduleSize;
  const darkPaths: string[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!qr.modules.get(row, col)) continue;
      if (isFinderArea(row, col, size)) continue;
      const x = (col + marginModules) * moduleSize;
      const y = (row + marginModules) * moduleSize;
      darkPaths.push(roundedRectPath(x + 0.8, y + 0.8, moduleSize - 1.6, moduleSize - 1.6, 2.8));
    }
  }

  const finder = (col: number, row: number) => {
    const x = (col + marginModules) * moduleSize;
    const y = (row + marginModules) * moduleSize;
    return `
      <path d="${roundedRectPath(x, y, moduleSize * 7, moduleSize * 7, 16)}" fill="${ALOO_BLUE}"/>
      <path d="${roundedRectPath(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5, 12)}" fill="#FFFFFF"/>
      <path d="${roundedRectPath(x + moduleSize * 2.25, y + moduleSize * 2.25, moduleSize * 2.5, moduleSize * 2.5, 7)}" fill="${DARK}"/>
    `;
  };

  const labelBlock = label
    ? `<text x="${total / 2}" y="${total + 28}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#4A5565">${esc(label)}</text>`
    : "";
  const svgHeight = label ? total + 42 : total;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${svgHeight}" viewBox="0 0 ${total} ${svgHeight}" fill="none" role="img" aria-label="QR code">
  <rect width="${total}" height="${svgHeight}" rx="24" fill="#FFFFFF"/>
  <g>
    <path d="${darkPaths.join(" ")}" fill="${DARK}"/>
    ${finder(0, 0)}
    ${finder(size - 7, 0)}
    ${finder(0, size - 7)}
  </g>
  ${labelBlock}
</svg>`;
}
