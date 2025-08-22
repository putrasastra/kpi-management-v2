
import { KpiConfig, BonusScheme, KpiIndicator, RealisasiInput, CalculationResult, KpiResultDetail, DivisionData } from '../types';
import { parseRupiah } from './formatters';

export const calculateBonus = (
    kpiConfigs: KpiConfig[],
    bonusSchemes: BonusScheme[],
    kpiIndicators: KpiIndicator[],
    realisasiInputs: RealisasiInput,
    bonusCalculationMethod: DivisionData['bonusCalculationMethod'],
    customCostKeywords?: string[]
): CalculationResult => {
    let totalOmsetRealisasi = 0;
    let totalOmsetTarget = 0;
    let grandTotalPoin = 0;
    const details: KpiResultDetail[] = [];

    // Cost keywords helper (supports custom override per division)
    const DEFAULT_COST_KEYWORDS = ['biaya', 'cost', 'spend', 'ads', 'iklan'];
    const COST_KEYWORDS = (customCostKeywords && customCostKeywords.length > 0)
        ? customCostKeywords.map(k => (k || '').toLowerCase().trim()).filter(Boolean)
        : DEFAULT_COST_KEYWORDS;
    const isCostKpi = (name: string) => {
        const n = (name || '').toLowerCase();
        return COST_KEYWORDS.some(kw => n.includes(kw));
    };

    // Pre-calculate ROAS values
    const platforms = [...new Set(kpiConfigs.map(k => k.platform))];
    const roasValues: { [key: number]: number } = {};

    platforms.forEach(platform => {
        const roasKpi = kpiConfigs.find(k => k.platform === platform && k.specialCalc === 'ROAS');
        let omsetKpi = kpiConfigs.find(k => k.platform === platform && k.name.toLowerCase().includes('omset'));
        const biayaKpi = kpiConfigs.find(k => k.platform === platform && isCostKpi(k.name));

        // Fallback: if no explicit 'omset' KPI, pick the first currency KPI in this platform that is not a cost-related KPI
        if (!omsetKpi) {
            omsetKpi = kpiConfigs.find(k => k.platform === platform && k.isCurrency && !isCostKpi(k.name) && k.specialCalc !== 'ROAS');
        }

        if (roasKpi && omsetKpi && biayaKpi) {
            const omsetRealisasi = parseFloat(parseRupiah(realisasiInputs[omsetKpi.id] || '0')) || 0;
            const biayaRealisasi = parseFloat(parseRupiah(realisasiInputs[biayaKpi.id] || '0')) || 0;
            const calculatedRoas = biayaRealisasi > 0 ? (omsetRealisasi / biayaRealisasi) : 0;
            roasValues[roasKpi.id] = calculatedRoas;
        }
    });

    kpiConfigs.forEach(kpi => {
        let realisasi: number;
        if (kpi.specialCalc === 'ROAS') {
            realisasi = roasValues[kpi.id] || 0;
        } else {
            const realisasiValue = kpi.isCurrency 
                ? parseRupiah(realisasiInputs[kpi.id] || '0') 
                : (realisasiInputs[kpi.id] || '0').replace(',', '.');
            realisasi = parseFloat(realisasiValue) || 0;
        }

        if (kpi.isCurrency && !isCostKpi(kpi.name)) {
            totalOmsetRealisasi += realisasi;
            totalOmsetTarget += kpi.target;
        }

        const target = kpi.target;
        let achievementRatio = 0;
        if (target > 0 && realisasi > 0) {
            if (kpi.specialCalc === 'ROAS' && kpi.minTarget && realisasi < kpi.minTarget) {
                achievementRatio = 0;
            } else if (kpi.type === 'higher_is_better') {
                achievementRatio = realisasi / target;
            } else { // lower_is_better
                achievementRatio = target / realisasi;
            }
        }
        
        let poin = achievementRatio * kpi.bobot;

        if (kpi.pointCapping === 'capped' && poin > kpi.bobot) {
            poin = kpi.bobot;
        }
        
        const score = achievementRatio * 100;
        grandTotalPoin += poin;

        details.push({ id: kpi.id, score, poin, realisasi });
    });

    const sortedIndicators = [...kpiIndicators].sort((a, b) => b.threshold - a.threshold);
    let kpiIndicator: KpiIndicator | { name: string, color: string } = { name: 'N/A', color: 'bg-slate-400' };
    for (const indicator of sortedIndicators) {
        if (grandTotalPoin >= indicator.threshold) {
            kpiIndicator = indicator;
            break;
        }
    }

    // Handle NON_SALES method
    if (bonusCalculationMethod === 'NON_SALES') {
        return {
            grandTotalPoin,
            finalBonus: 0,
            activeMultiplier: 0,
            kpiIndicator,
            omsetIndicator: { name: 'N/A' },
            totalOmsetRealisasi,
            totalOmsetTarget,
            details,
        };
    }

    // Continue for OMSET_BASED and POINTS_BASED
    const sortedSchemes = [...bonusSchemes].sort((a, b) => b.threshold - a.threshold);
    let activeMultiplier = 0;
    let omsetIndicator: BonusScheme | { name: string } = { name: 'N/A' };
    
    // Determine the source value for bonus calculation based on the division's method
    const sourceValue = bonusCalculationMethod === 'POINTS_BASED' ? grandTotalPoin : totalOmsetRealisasi;

    for (const scheme of sortedSchemes) {
        if (sourceValue >= scheme.threshold) {
            activeMultiplier = scheme.multiplier;
            omsetIndicator = scheme;
            break;
        }
    }

    const finalBonus = (grandTotalPoin * 1000) * activeMultiplier;

    return {
        grandTotalPoin,
        finalBonus,
        activeMultiplier,
        kpiIndicator,
        omsetIndicator,
        totalOmsetRealisasi,
        totalOmsetTarget,
        details,
    };
};