package main

import (
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

func parseRupiah(s string) float64 {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0
	}
	// keep digits, comma and dot
	re := regexp.MustCompile(`[^0-9.,\-]`)
	s = re.ReplaceAllString(s, "")
	// normalize thousand/decimal: remove dots, replace comma with dot
	s = strings.ReplaceAll(s, ".", "")
	s = strings.ReplaceAll(s, ",", ".")
	f, _ := strconv.ParseFloat(s, 64)
	return f
}

func CalculateBonus(kpiConfigs []KpiConfig, bonusSchemes []BonusScheme, kpiIndicators []KpiIndicator, realisasiInputs map[uint]string, bonusCalculationMethod string, customCostKeywords []string) CalculationResult {
	totalOmsetRealisasi := 0.0
	totalOmsetTarget := 0.0
	grandTotalPoin := 0.0
	details := make([]KpiResultDetail, 0, len(kpiConfigs))

	// Cost keywords
	defaultCostKeywords := []string{"biaya", "cost", "spend", "ads", "iklan"}
	costKeywords := defaultCostKeywords
	if len(customCostKeywords) > 0 {
		costKeywords = make([]string, 0, len(customCostKeywords))
		for _, k := range customCostKeywords {
			k = strings.ToLower(strings.TrimSpace(k))
			if k != "" {
				costKeywords = append(costKeywords, k)
			}
		}
	}
	isCostKpi := func(name string) bool {
		n := strings.ToLower(name)
		for _, kw := range costKeywords {
			if strings.Contains(n, kw) { return true }
		}
		return false
	}

	// Pre-calc ROAS per platform
	platformSet := map[string]struct{}{}
	for _, k := range kpiConfigs { platformSet[k.Platform] = struct{}{} }
	roasValues := map[uint]float64{}
	for platform := range platformSet {
		var roasKpi *KpiConfig
		var omsetKpi *KpiConfig
		var biayaKpi *KpiConfig
		for i := range kpiConfigs {
			k := &kpiConfigs[i]
			if k.Platform != platform { continue }
			if k.SpecialCalc != nil && *k.SpecialCalc == "ROAS" { roasKpi = k }
			if strings.Contains(strings.ToLower(k.Name), "omset") { omsetKpi = k }
			if biayaKpi == nil && isCostKpi(k.Name) { biayaKpi = k }
		}
		if omsetKpi == nil { // fallback: first currency non-cost non-ROAS
			for i := range kpiConfigs {
				k := &kpiConfigs[i]
				if k.Platform != platform { continue }
				if k.IsCurrency && !isCostKpi(k.Name) && (k.SpecialCalc == nil || *k.SpecialCalc != "ROAS") { omsetKpi = k; break }
			}
		}
		if roasKpi != nil && omsetKpi != nil && biayaKpi != nil {
			omsetRealisasi := parseRupiah(realisasiInputs[omsetKpi.ID])
			biayaRealisasi := parseRupiah(realisasiInputs[biayaKpi.ID])
			calc := 0.0
			if biayaRealisasi > 0 { calc = omsetRealisasi / biayaRealisasi }
			roasValues[roasKpi.ID] = calc
		}
	}

	for _, kpi := range kpiConfigs {
		realisasi := 0.0
		if kpi.SpecialCalc != nil && *kpi.SpecialCalc == "ROAS" {
			realisasi = roasValues[kpi.ID]
		} else {
			val := "0"
			if v, ok := realisasiInputs[kpi.ID]; ok { val = v }
			if kpi.IsCurrency { realisasi = parseRupiah(val) } else { val = strings.ReplaceAll(val, ",", "."); f, _ := strconv.ParseFloat(val, 64); realisasi = f }
		}

		if kpi.IsCurrency && !isCostKpi(kpi.Name) {
			totalOmsetRealisasi += realisasi
			totalOmsetTarget += kpi.Target
		}

		target := kpi.Target
		achievementRatio := 0.0
		if target > 0 && realisasi > 0 {
			if kpi.SpecialCalc != nil && *kpi.SpecialCalc == "ROAS" && kpi.MinTarget != nil && realisasi < *kpi.MinTarget {
				achievementRatio = 0
			} else if kpi.Type == "higher_is_better" {
				achievementRatio = realisasi / target
			} else {
				achievementRatio = target / math.Max(realisasi, 1e-9)
			}
		}
		poin := achievementRatio * kpi.Bobot
		if kpi.PointCapping == "capped" && poin > kpi.Bobot { poin = kpi.Bobot }
		score := achievementRatio * 100
		grandTotalPoin += poin
		details = append(details, KpiResultDetail{ID: kpi.ID, Score: score, Poin: poin, Realisasi: realisasi})
	}

	sort.Slice(kpiIndicators, func(i, j int) bool { return kpiIndicators[i].Threshold > kpiIndicators[j].Threshold })
	kpiIndicator := map[string]any{"name": "N/A", "color": "bg-slate-400"}
	for _, ind := range kpiIndicators {
		if grandTotalPoin >= ind.Threshold { kpiIndicator = map[string]any{"id": ind.ID, "name": ind.Name, "threshold": ind.Threshold, "color": ind.Color}; break }
	}

	if bonusCalculationMethod == "NON_SALES" {
		return CalculationResult{GrandTotalPoin: grandTotalPoin, FinalBonus: 0, ActiveMultiplier: 0, KpiIndicator: kpiIndicator, OmsetIndicator: map[string]any{"name":"N/A"}, TotalOmsetRealisasi: totalOmsetRealisasi, TotalOmsetTarget: totalOmsetTarget, Details: details}
	}

	sort.Slice(bonusSchemes, func(i, j int) bool { return bonusSchemes[i].Threshold > bonusSchemes[j].Threshold })
	activeMultiplier := 0.0
	omsetIndicator := map[string]any{"name": "N/A"}
	sourceValue := totalOmsetRealisasi
	if bonusCalculationMethod == "POINTS_BASED" { sourceValue = grandTotalPoin }
	for _, s := range bonusSchemes {
		if sourceValue >= s.Threshold { activeMultiplier = s.Multiplier; omsetIndicator = map[string]any{"id": s.ID, "name": s.Name, "threshold": s.Threshold, "multiplier": s.Multiplier}; break }
	}
	finalBonus := (grandTotalPoin * 1000) * activeMultiplier
	return CalculationResult{GrandTotalPoin: grandTotalPoin, FinalBonus: finalBonus, ActiveMultiplier: activeMultiplier, KpiIndicator: kpiIndicator, OmsetIndicator: omsetIndicator, TotalOmsetRealisasi: totalOmsetRealisasi, TotalOmsetTarget: totalOmsetTarget, Details: details}
}