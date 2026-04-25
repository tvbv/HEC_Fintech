import * as React from "react";

/**
 * Concierge custom SVG icon library.
 * 2px stroke, rounded line-caps, consistent visual weight.
 * Default color = currentColor so they inherit text color.
 */
type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

const wrap = (size: number, children: React.ReactNode, className?: string) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const IconBank = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 10 L12 4 L21 10" />
      <path d="M5 10 V19" /><path d="M9 10 V19" /><path d="M15 10 V19" /><path d="M19 10 V19" />
      <path d="M3 21 H21" />
    </>, className);

export const IconDocument = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M14 3 H7 a2 2 0 0 0 -2 2 V19 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V8 Z" />
      <path d="M14 3 V8 H19" />
      <path d="M9 13 H15" /><path d="M9 17 H13" />
    </>, className);

export const IconDocumentCheck = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M14 3 H7 a2 2 0 0 0 -2 2 V19 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V8 Z" />
      <path d="M14 3 V8 H19" />
      <path d="M8.5 14.5 L11 17 L15.5 12.5" />
    </>, className);

export const IconCalculator = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M7 7 H17" />
      <circle cx="8" cy="12" r="0.6" fill="currentColor" /><circle cx="12" cy="12" r="0.6" fill="currentColor" /><circle cx="16" cy="12" r="0.6" fill="currentColor" />
      <circle cx="8" cy="16" r="0.6" fill="currentColor" /><circle cx="12" cy="16" r="0.6" fill="currentColor" /><circle cx="16" cy="16" r="0.6" fill="currentColor" />
    </>, className);

export const IconGift = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12 H21" /><path d="M12 8 V21" />
      <path d="M12 8 C12 6 9 4 7.5 5.5 C6 7 8 8 12 8 Z" />
      <path d="M12 8 C12 6 15 4 16.5 5.5 C18 7 16 8 12 8 Z" />
    </>, className);

export const IconHome = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 11 L12 3 L21 11 V20 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 Z" />
      <path d="M9 21 V14 H15 V21" />
    </>, className);

export const IconMapPin = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M12 21 C8 17 5 13 5 9 a7 7 0 0 1 14 0 C19 13 16 17 12 21 Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>, className);

export const IconBell = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M6 8 a6 6 0 0 1 12 0 V13 L20 16 H4 L6 13 Z" />
      <path d="M10 19 a2 2 0 0 0 4 0" />
    </>, className);

export const IconChartBar = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 21 H21" />
      <rect x="6" y="13" width="3" height="8" rx="0.5" />
      <rect x="11" y="8" width="3" height="13" rx="0.5" />
      <rect x="16" y="4" width="3" height="17" rx="0.5" />
    </>, className);

export const IconPerson = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" />
    </>, className);

export const IconLock = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11 V7 a4 4 0 0 1 8 0 V11" />
    </>, className);

export const IconUnlock = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11 V7 a4 4 0 0 1 7 -3" />
    </>, className);

export const IconStar = ({ size = 24, className, filled }: IconProps & { filled?: boolean }) =>
  wrap(size,
    <path d="M12 3 L14.5 9 L21 9.5 L16 14 L17.5 21 L12 17.5 L6.5 21 L8 14 L3 9.5 L9.5 9 Z" fill={filled ? "currentColor" : "none"} />,
    className);

export const IconFire = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M12 3 C9 7 7 9 7 13 a5 5 0 0 0 10 0 C17 11 15 9 14 7 C14 9 12 10 12 8 C12 6 13 5 12 3 Z" />
    </>, className);

export const IconLightning = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <path d="M13 3 L4 14 H11 L9 21 L20 10 H13 Z" />, className);

export const IconKey = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12 H21 M17 12 V16 M21 12 V15" />
    </>, className);

export const IconCheckCircle = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5 L11 15.5 L16 10" />
    </>, className);

export const IconCircle = ({ size = 24, className }: IconProps) =>
  wrap(size, <circle cx="12" cy="12" r="9" />, className);

export const IconClock = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 V12 L15 14" />
    </>, className);

export const IconHourglass = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M6 3 H18 M6 21 H18" />
      <path d="M7 3 V7 L12 12 L17 7 V3" />
      <path d="M7 21 V17 L12 12 L17 17 V21" />
    </>, className);

export const IconCoins = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7 V12 a6 3 0 0 0 12 0 V7" />
      <path d="M9 14 a6 3 0 0 0 6 -3" />
      <ellipse cx="15" cy="14" rx="6" ry="3" />
      <path d="M9 14 V19 a6 3 0 0 0 12 0 V14" />
    </>, className);

export const IconCard = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10 H21" /><path d="M7 15 H10" />
    </>, className);

export const IconPhone = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18 H13" />
    </>, className);

export const IconShield = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <path d="M12 3 L4 6 V12 C4 17 8 20 12 21 C16 20 20 17 20 12 V6 Z" />, className);

export const IconStamp = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M5 21 H19" />
      <rect x="4" y="14" width="16" height="4" rx="1" />
      <path d="M9 14 V11 a3 3 0 0 1 6 0 V14" />
    </>, className);

export const IconReceipt = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M5 3 V21 L8 19 L12 21 L16 19 L19 21 V3 Z" />
      <path d="M9 8 H15 M9 12 H15 M9 16 H13" />
    </>, className);

export const IconCalendar = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10 H21 M8 3 V7 M16 3 V7" />
    </>, className);

export const IconCompass = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9 L13 13 L9 15 L11 11 Z" fill="currentColor" />
    </>, className);

export const IconGlobe = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12 H21 M12 3 a13 13 0 0 1 0 18 a13 13 0 0 1 0 -18 Z" />
    </>, className);

export const IconArrowRight = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M5 12 H19" /><path d="M13 6 L19 12 L13 18" /></>, className);

export const IconArrowLeft = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M19 12 H5" /><path d="M11 6 L5 12 L11 18" /></>, className);

export const IconArrowUp = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M12 19 V5" /><path d="M6 11 L12 5 L18 11" /></>, className);

export const IconArrowDown = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M12 5 V19" /><path d="M6 13 L12 19 L18 13" /></>, className);

export const IconTrain = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="5" y="3" width="14" height="14" rx="2" />
      <path d="M5 11 H19" /><circle cx="9" cy="14" r="0.6" fill="currentColor" /><circle cx="15" cy="14" r="0.6" fill="currentColor" />
      <path d="M7 17 L4 21 M17 17 L20 21" />
    </>, className);

export const IconHeartPulse = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M12 21 C7 17 3 13 3 8 a4 4 0 0 1 9 -2 a4 4 0 0 1 9 2 C21 13 17 17 12 21" />
      <path d="M7 11 H10 L11 9 L13 13 L14 11 H17" />
    </>, className);

export const IconGraduationCap = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M12 3 L2 8 L12 13 L22 8 Z" />
      <path d="M6 10 V15 C6 17 9 18 12 18 C15 18 18 17 18 15 V10" />
    </>, className);

export const IconBriefcase = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7 V5 a1 1 0 0 1 1 -1 H14 a1 1 0 0 1 1 1 V7" />
      <path d="M3 13 H21" />
    </>, className);

export const IconSearch = ({ size = 24, className }: IconProps) =>
  wrap(size, <><circle cx="11" cy="11" r="6" /><path d="M16 16 L20 20" /></>, className);

export const IconEdit = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M16 3 L21 8 L8 21 H3 V16 Z" />
      <path d="M14 5 L19 10" />
    </>, className);

export const IconLogout = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M9 3 H5 a2 2 0 0 0 -2 2 V19 a2 2 0 0 0 2 2 H9" />
      <path d="M16 8 L21 12 L16 16" />
      <path d="M21 12 H9" />
    </>, className);

export const IconSettings = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12 a7 7 0 0 0 -0.4 -2.4 L20 8 L18 5 L16 5.7 a7 7 0 0 0 -2.6 -1.5 L13 2 H11 L10.6 4.2 a7 7 0 0 0 -2.6 1.5 L6 5 L4 8 L5.4 9.6 A7 7 0 0 0 5 12 c0 0.8 0.1 1.6 0.4 2.4 L4 16 L6 19 L8 18.3 a7 7 0 0 0 2.6 1.5 L11 22 H13 L13.4 19.8 a7 7 0 0 0 2.6 -1.5 L18 19 L20 16 L18.6 14.4 A7 7 0 0 0 19 12 Z" />
    </>, className);

export const IconDownload = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M12 3 V15" /><path d="M6 11 L12 17 L18 11" /><path d="M4 21 H20" /></>, className);

export const IconMap = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M9 4 L3 6 V20 L9 18 L15 20 L21 18 V4 L15 6 Z" />
      <path d="M9 4 V18 M15 6 V20" />
    </>, className);

export const IconClose = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M6 6 L18 18" /><path d="M18 6 L6 18" /></>, className);

export const IconCheck = ({ size = 24, className }: IconProps) =>
  wrap(size, <path d="M5 12.5 L10 17 L19 7" />, className);

export const IconChevronRight = ({ size = 24, className }: IconProps) =>
  wrap(size, <path d="M9 6 L15 12 L9 18" />, className);

export const IconChevronDown = ({ size = 24, className }: IconProps) =>
  wrap(size, <path d="M6 9 L12 15 L18 9" />, className);

export const IconCamera = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 8 H7 L9 5 H15 L17 8 H21 V19 H3 Z" />
      <circle cx="12" cy="13" r="4" />
    </>, className);

export const IconEmail = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7 L12 13 L21 7" />
    </>, className);

export const IconClipboard = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12 H15 M9 16 H13" />
    </>, className);

export const IconLightbulb = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M9 18 H15" /><path d="M10 21 H14" />
      <path d="M12 3 a6 6 0 0 1 4 10 V16 H8 V13 a6 6 0 0 1 4 -10 Z" />
    </>, className);

export const IconSparkle = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <path d="M12 3 L13.5 9 L19 10.5 L13.5 12 L12 18 L10.5 12 L5 10.5 L10.5 9 Z" fill="currentColor" />, className);

export const IconCircles = ({ size = 24, className }: IconProps) =>
  wrap(size, <><circle cx="9" cy="12" r="6" /><circle cx="15" cy="12" r="6" /></>, className);

export const IconChat = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <path d="M4 5 H20 V17 H13 L8 21 V17 H4 Z" />, className);

export const IconPlus = ({ size = 24, className }: IconProps) =>
  wrap(size, <><path d="M12 5 V19" /><path d="M5 12 H19" /></>, className);

export const IconPackage = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 7 L12 3 L21 7 V17 L12 21 L3 17 Z" />
      <path d="M3 7 L12 11 L21 7" />
      <path d="M12 11 V21" />
    </>, className);

export const IconPaperPlane = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <path d="M3 12 L21 3 L14 21 L11 13 Z" />
      <path d="M11 13 L21 3" />
    </>, className);

export const IconBuildingTax = ({ size = 24, className }: IconProps) =>
  wrap(size,
    <>
      <rect x="4" y="4" width="16" height="17" rx="1" />
      <path d="M4 9 H20" />
      <path d="M9 13 H11 M13 13 H15 M9 17 H11 M13 17 H15" />
    </>, className);
