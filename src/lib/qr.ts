/**
 * QR code helper. Renders a PNG buffer that points at the public badge page.
 */

import QRCode from "qrcode";
import { env } from "./env";

export function badgePublicUrl(token: string): string {
  return `${env.publicBaseUrl}/?badge=${encodeURIComponent(token)}`;
}

export async function badgeQrPng(token: string): Promise<Buffer> {
  return QRCode.toBuffer(badgePublicUrl(token), {
    type: "png",
    width: 320,
    margin: 2,
    color: { dark: "#581127", light: "#FFFFFF" },
  });
}
