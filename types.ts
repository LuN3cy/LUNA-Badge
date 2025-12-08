export interface LogoSettings {
  opacity: number;
  scale: number;
  contrast: number;
  grayscale: boolean;
  invert: boolean;
  brightness: number;
  sepia: boolean;
  overlayColor: string;
  overlayEnabled: boolean;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  opacity: 100,
  scale: 100,
  contrast: 100,
  grayscale: false,
  invert: false,
  brightness: 100,
  sepia: false,
  overlayColor: '#ffffff',
  overlayEnabled: false,
};

export interface BadgeData {
  name: string;
  role: string;
  id: string;
  address: string;
  contact: string;
  company: string;
  qrValue: string;
  customFields: Record<string, string>;
  logo?: string; // Base64 data URL
  logoSettings: LogoSettings;
  qrEnabled: boolean;
  isCustomQr: boolean;
  cornerRadius: number;
}

export type BadgeTheme = 'industrial' | 'modern' | 'swiss' | 'creative' | 'formal-red' | 'minimalism' | 'matrix';

export type Language = 'en' | 'zh';

export const INITIAL_BADGE_DATA: BadgeData = {
  name: "JIMMY LEE",
  role: "ALL-ACCESS",
  id: "20381930",
  address: "1928 PIKE PL.\nSEATTLE WA 98101",
  contact: "JIMMY@INTERNET.DEV\n+1 555 0192",
  company: "Internet Development Studio",
  qrValue: JSON.stringify({
    NAME: "JIMMY LEE",
    ROLE: "ALL-ACCESS",
    ID: "20381930",
    COMPANY: "Internet Development Studio",
    CONTACT: "JIMMY@INTERNET.DEV\n+1 555 0192",
    ADDRESS: "1928 PIKE PL.\nSEATTLE WA 98101"
  }, null, 2),
  customFields: {},
  logo: undefined,
  logoSettings: DEFAULT_LOGO_SETTINGS,
  qrEnabled: true,
  isCustomQr: false,
  cornerRadius: 24
};
