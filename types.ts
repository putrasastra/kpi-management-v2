
export interface KpiConfig {
    id: number;
    platform: string;
    name: string;
    bobot: number;
    target: number;
    minTarget?: number | null;
    type: 'higher_is_better' | 'lower_is_better';
    isCurrency: boolean;
    isPercentage: boolean;
    specialCalc?: 'ROAS' | null;
    pointCapping: 'uncapped' | 'capped';
}

export interface Employee {
    id: number;
    name: string;
}

export interface BonusScheme {
    id: number;
    name: string;
    threshold: number;
    multiplier: number;
}

export interface KpiIndicator {
    id: number;
    name:string;
    threshold: number;
    color: string;
}

export interface HistoryEntry {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string; // ISO string for when the entry was saved
    periodMonth: string;
    periodYear: number;
    totalPoints: number;
    bonus: number;
    results: CalculationResult;
    pdfDataUri?: string;
}

export interface DivisionData {
    employees: Employee[];
    history: HistoryEntry[];
    kpiConfigs: KpiConfig[];
    bonusSchemes: BonusScheme[];
    kpiIndicators: KpiIndicator[];
    bonusCalculationMethod: 'OMSET_BASED' | 'POINTS_BASED' | 'NON_SALES';
}

export interface AppData {
    [key: string]: DivisionData;
}

export interface CalculationResult {
    grandTotalPoin: number;
    finalBonus: number;
    activeMultiplier: number;
    kpiIndicator: KpiIndicator | { name: string; color: string; };
    omsetIndicator: BonusScheme | { name: string; };
    totalOmsetRealisasi: number;
    totalOmsetTarget: number;
    details: KpiResultDetail[];
}

export interface KpiResultDetail {
    id: number;
    score: number;
    poin: number;
    realisasi: number;
}

export interface RealisasiInput {
    [key: number]: string;
}

export interface LogEntry {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    division: string;
    details?: string;
}

export enum View {
    Calculator = 'calculator',
    Dashboard = 'dashboard',
    Admin = 'admin',
    Management = 'management',
    Logs = 'logs'
}

export type Theme = 'light' | 'dark';