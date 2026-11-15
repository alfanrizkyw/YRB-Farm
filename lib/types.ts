export type ReviewStatus = "published" | "pending" | "hidden";

export type Review = {
  id: string;
  name: string;
  city: string;
  rating: number;
  message: string;
  status: ReviewStatus;
  createdAt: string;
};

export type Promo = {
  id: string;
  title: string;
  description: string;
  badge: string;
  validUntil: string;
  active: boolean;
  createdAt: string;
};

export type SiteSettings = {
  waNumber: string;
  phoneDisplay: string;
  email: string;
  farmAddress: string;
  officeAddress: string;
  announcement: string;
  population: number;
  monthlyMin: number;
  monthlyMax: number;
  foundedYear: number;
  supplyAreas: number;
};

export type PublicContent = {
  reviews: Review[];
  promos: Promo[];
  settings: SiteSettings;
};

export type AdminContent = {
  reviews: Review[];
  promos: Promo[];
  settings: SiteSettings;
  connected: boolean;
};

export const defaultSettings: SiteSettings = {
  waNumber: "62811290002",
  phoneDisplay: "0811-290002",
  email: "yahyarizkibersama@gmail.com",
  farmAddress:
    "Dsn. Cemanglek, Margosari, Kec. Limbangan, Kendal, Jawa Tengah",
  officeAddress: "Jl. Klentengsari 11E, Banyumanik, Semarang",
  announcement: "",
  population: 2000,
  monthlyMin: 550,
  monthlyMax: 700,
  foundedYear: 2014,
  supplyAreas: 5,
};
