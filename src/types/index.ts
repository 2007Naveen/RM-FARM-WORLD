// மாடு & கன்றுகள் Types
export type CattleType = "COW" | "CALF";
export type CattleSource = "BORN_HERE" | "PURCHASED";

export interface Cattle {
  id: number;
  tagName: string;
  type: CattleType;
  breed?: string;
  birthDate?: string;
  source: CattleSource;
  purchasedDate?: string;
  soldDate?: string;
  kidsCount: number;
  inseminations?: Insemination[];
  milkLogs?: MilkLog[];
  vaccinations?: Vaccination[];
}

export interface MilkLog {
  id: number;
  cattleId: number;
  date: string;
  liters: number;
  session: "MORNING" | "EVENING";
}

// ஆடு & குட்டிகள் Types
export type GoatType = "GOAT" | "KUTTY";
export type GoatSource = "BORN_HERE" | "PURCHASED";

export interface Goat {
  id: number;
  tagName: string;
  type: GoatType;
  birthDate?: string;
  source: GoatSource;
  purchasedDate?: string;
  soldDate?: string;
  kidsCount: number;
  inseminations?: Insemination[];
  vaccinations?: Vaccination[];
}

// சினை ஊசி Type
export interface Insemination {
  id: number;
  inseminationDate: string;
  expectedDeliveryDate: string;
  notes?: string;
  cattleId?: number;
  goatId?: number;
}

// கோழிப் பண்ணை Types
export interface PoultryBatch {
  id: number;
  batchName: string;
  hatchDate: string;
  henType: string;
  totalChicks: number;
  diedCount: number;
  soldCount: number;
  day7VaccineDate?: string;
  day12VaccineDate?: string;
  day22VaccineDate?: string;
  beakTrimmingDate?: string;
  immutonDate?: string;
  bactinilDate?: string;
  sales?: PoultrySale[];
}

export interface PoultrySale {
  id: number;
  batchId: number;
  buyerFirstName: string;
  buyerLastName: string;
  buyerAddress: string;
  chicksSold: number;
  saleDate: string;
  totalAmount: number;
}

// தடுப்பூசி Type
export interface Vaccination {
  id: number;
  name: string;
  date: string;
  description?: string;
  cattleId?: number;
  goatId?: number;
}