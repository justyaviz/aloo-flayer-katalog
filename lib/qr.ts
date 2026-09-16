import QRCode from "qrcode";

const ALOO_BLUE = "#1690F5";
const BLACK = "#101114";

function isFinderArea(row: number, col: number, size: number) {
  const topLeft = row < 7 && col < 7;
  const topRight = row < 7 && col >= size - 7;
  const bottomLeft = row >= size - 7 && col < 7;
  return topLeft || topRight || bottomLeft;
}

function finderEye(x: number, y: number, m: number) {
  const outer = 7 * m;
  const inset = 1.05 * m;
  const coreInset = 2.1 * m;
  return `
    <rect x="${x}" y="${y}" width="${outer}" height="${outer}" rx="${1.15 * m}" fill="${ALOO_BLUE}"/>
    <rect x="${x + inset}" y="${y + inset}" width="${outer - inset * 2}" height="${outer - inset * 2}" rx="${0.82 * m}" fill="#FFFFFF"/>
    <rect x="${x + coreInset}" y="${y + coreInset}" width="${outer - coreInset * 2}" height="${outer - coreInset * 2}" rx="${0.3 * m}" fill="${BLACK}"/>
  `;
}

export function generateStyledQrSvg(text: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const margin = 3;
  const m = 10;
  const total = (size + margin * 2) * m;
  const modules: string[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!qr.modules.get(row, col)) continue;
      if (isFinderArea(row, col, size)) continue;
      const x = (col + margin) * m;
      const y = (row + margin) * m;
      // Keep data modules crisp and square for maximum scan reliability.
      modules.push(`<rect x="${x}" y="${y}" width="${m}" height="${m}" fill="${BLACK}"/>`);
    }
  }

  const tlX = margin * m;
  const tlY = margin * m;
  const trX = (margin + size - 7) * m;
  const blY = (margin + size - 7) * m;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}" role="img" aria-label="aloo QR code">
  <rect width="${total}" height="${total}" fill="#FFFFFF"/>
  <g shape-rendering="crispEdges">${modules.join("")}</g>
  ${finderEye(tlX, tlY, m)}
  ${finderEye(trX, tlY, m)}
  ${finderEye(tlX, blY, m)}
</svg>`;
}
