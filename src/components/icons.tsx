/**
 * Hand authored brand SVG marks. No raster, no clip art, no emoji icons.
 * The logo is two interlinked rings (maroon and gold) with a gold spark above.
 */
import { CheckType } from "@/lib/checks";

export function Logo({ light = false }: { light?: boolean }) {
  const ring1 = light ? "#E7D7AE" : "#7C1F39";
  const spark = light ? "#E7D7AE" : "#C2A14D";
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 6 26.4 10.5 24 15 21.6 10.5 24 6Z" fill={spark} />
      <circle cx="19" cy="27" r="11" stroke={ring1} strokeWidth="2.6" />
      <circle cx="29" cy="27" r="11" stroke="#C2A14D" strokeWidth="2.6" />
    </svg>
  );
}

export const CheckIcons: Record<CheckType, JSX.Element> = {
  government_id: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <circle cx="8" cy="11" r="2.2" />
      <path d="M4.7 16.2c.4-1.7 1.8-2.5 3.3-2.5s2.9.8 3.3 2.5" />
      <path d="M13.6 10h5.4M13.6 13.2h5.4" stroke="#C2A14D" />
    </svg>
  ),
  employment_income: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" />
      <path d="M3 12.6h18" stroke="#C2A14D" />
      <path d="M11 12v1.4h2V12" stroke="#C2A14D" />
    </svg>
  ),
  education: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 22 9 12 14 2 9 12 4Z" />
      <path d="M6 11v4.6c0 1.4 2.7 2.4 6 2.4s6-1 6-2.4V11" stroke="#C2A14D" />
      <path d="M22 9v5" />
    </svg>
  ),
  marital_status: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9.4" cy="14.6" r="4.7" stroke="#7C1F39" />
      <circle cx="15" cy="14.6" r="4.7" stroke="#C2A14D" />
      <path d="M9.4 4.4 11.3 7.7H7.5L9.4 4.4Z" fill="#C2A14D" stroke="#C2A14D" strokeWidth="1" />
    </svg>
  ),
  criminal_record: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 5 5.5v5.2c0 4.4 3 7.7 7 9.3 4-1.6 7-4.9 7-9.3V5.5L12 3Z" />
      <path d="m8.8 11.7 2.1 2.1 4.3-4.4" stroke="#C2A14D" />
    </svg>
  ),
};

export const BadgeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="9" r="5.5" />
    <path d="m8.4 13.4-1.4 6.1 5-2.6 5 2.6-1.4-6.1" stroke="#C2A14D" />
  </svg>
);

export const VerifyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m20 20-4.6-4.6" />
    <path d="m7.9 10.5 2 2 3.4-3.6" stroke="#C2A14D" />
  </svg>
);

export const ShieldIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#7C1F39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10.5 4.6-1.7 8-5.5 8-10.5v-6L12 2.5Z" />
    <path d="m8.5 12 2.3 2.3L15.5 9.5" stroke="#C2A14D" />
  </svg>
);

export const SealIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#A6852F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="10" r="6" />
    <path d="m9.5 10 1.7 1.7 3.3-3.4" stroke="#7C1F39" />
    <path d="M9 15.5 8 21l4-2 4 2-1-5.5" />
  </svg>
);

export const TickGold = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#A6852F" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const TickGreen = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#2E7D5B" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const Cross = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#B23A48" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
);

export const Ornament = (
  <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
    <path d="M13 2.5c2.6 3.2 2.6 7.3 0 10.5-2.6-3.2-2.6-7.3 0-10.5Z" fill="#C2A14D" />
    <path d="M13 23.5c2.6-3.2 2.6-7.3 0-10.5-2.6 3.2-2.6 7.3 0 10.5Z" fill="#C2A14D" />
    <circle cx="13" cy="13" r="2.1" fill="#7C1F39" />
  </svg>
);

export const HeartLight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E7D7AE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </svg>
);

export const LockLight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E7D7AE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="10.5" width="14" height="9" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </svg>
);

export const ShareLight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E7D7AE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
  </svg>
);

export const RupeeLight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E7D7AE" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 5h10M7 9h10M7 5c4.2 0 6.3 1.1 6.3 4S11.2 13 7 13l7.5 6" />
  </svg>
);

function buildMandala() {
  const petals: string[] = [];
  for (let a = 0; a < 360; a += 30) {
    petals.push(`<ellipse cx='100' cy='52' rx='11' ry='36' transform='rotate(${a} 100 100)'/>`);
  }
  return petals.join("");
}

export function Mandala() {
  const inner = `${buildMandala()}<circle cx='100' cy='100' r='18'/><circle cx='100' cy='100' r='27'/><circle cx='100' cy='100' r='90'/>`;
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="#C2A14D"
      strokeWidth="1.1"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
