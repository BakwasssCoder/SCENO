export type CityStatus = "LIVE" | "COMING_SOON" | "HIDDEN";

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string | null;
  status: CityStatus;
  hero_headline: string | null;
  hero_subheadline: string | null;
  launch_date: string | null;
  sort_order: number;
}

export interface EventCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  sort_order: number;
  active: boolean;
}

export interface EventMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  sort_order: number;
}

export interface EventTicket {
  id: string;
  name: string;
  price: number;
  capacity: number;
  sold: number;
}

export interface Venue {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  capacity: number | null;
}

export interface DiscoveryEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  featured: boolean;
  venue: Venue | null;
  category: EventCategory | null;
  media: EventMedia[];
  tickets: EventTicket[];
}
