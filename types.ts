
export interface DishVariant {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  frameCount: number;
  sequenceBaseUrl: string;
  suffix?: string;
  isDarkOverride?: boolean;
}

export interface Reservation {
  id: string;
  name: string;
  email: string;
  guests: number;
  date: string;
  status: 'pending' | 'confirmed';
  timestamp: number;
}

export interface SiteContent {
  dishes: DishVariant[];
  about: string;
  tagline: string;
}
