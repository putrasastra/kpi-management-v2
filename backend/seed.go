package main

import (
	"log"
)

// InitialDivisionData mirrors the frontend structure for seeding
type InitialDivisionData struct {
	BonusCalculationMethod string             `json:"bonusCalculationMethod"`
	Employees              []InitialEmployee   `json:"employees"`
	KpiConfigs             []InitialKpiConfig  `json:"kpiConfigs"`
	BonusSchemes           []InitialBonusScheme `json:"bonusSchemes"`
	KpiIndicators          []InitialKpiIndicator `json:"kpiIndicators"`
}

type InitialEmployee struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type InitialKpiConfig struct {
	ID           int      `json:"id"`
	Platform     string   `json:"platform"`
	Name         string   `json:"name"`
	Bobot        float64  `json:"bobot"`
	Target       float64  `json:"target"`
	MinTarget    *float64 `json:"minTarget"`
	Type         string   `json:"type"`
	IsCurrency   bool     `json:"isCurrency"`
	IsPercentage bool     `json:"isPercentage"`
	SpecialCalc  *string  `json:"specialCalc"`
	PointCapping string   `json:"pointCapping"`
}

type InitialBonusScheme struct {
	ID         int     `json:"id"`
	Name       string  `json:"name"`
	Threshold  float64 `json:"threshold"`
	Multiplier float64 `json:"multiplier"`
}

type InitialKpiIndicator struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Threshold float64 `json:"threshold"`
	Color     string  `json:"color"`
}

// SeedDatabase populates the database with initial data from frontend useAppData
func SeedDatabase() {
	// Check if already seeded
	var count int64
	db.Model(&Division{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping...")
		return
	}

	// Initial data mirroring frontend useAppData.ts
	initialData := map[string]InitialDivisionData{
		"Advertiser MP": {
			BonusCalculationMethod: "OMSET_BASED",
			Employees: []InitialEmployee{
				{ID: 101, Name: "Budi Santoso"},
				{ID: 102, Name: "Citra Lestari"},
			},
			KpiConfigs: []InitialKpiConfig{
				{ID: 1, Platform: "Shopee", Name: "ROAS Shopee", Bobot: 15, Target: 12, MinTarget: ptrFloat64(10), Type: "higher_is_better", IsCurrency: false, IsPercentage: false, SpecialCalc: ptrString("ROAS"), PointCapping: "uncapped"},
				{ID: 2, Platform: "Shopee", Name: "Realisasi Omset Shopee", Bobot: 10, Target: 250000000, Type: "higher_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 3, Platform: "Shopee", Name: "Efisiensi Biaya Iklan Shopee", Bobot: 5, Target: 25000000, Type: "lower_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 4, Platform: "Lazada", Name: "ROAS Lazada", Bobot: 15, Target: 8, MinTarget: ptrFloat64(6), Type: "higher_is_better", IsCurrency: false, IsPercentage: false, SpecialCalc: ptrString("ROAS"), PointCapping: "uncapped"},
				{ID: 5, Platform: "Lazada", Name: "Realisasi Omset Lazada", Bobot: 10, Target: 150000000, Type: "higher_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 6, Platform: "Lazada", Name: "Efisiensi Biaya Iklan Lazada", Bobot: 5, Target: 20000000, Type: "lower_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 7, Platform: "TikTok Shop", Name: "ROAS TikTok Shop", Bobot: 15, Target: 5, MinTarget: ptrFloat64(4), Type: "higher_is_better", IsCurrency: false, IsPercentage: false, SpecialCalc: ptrString("ROAS"), PointCapping: "uncapped"},
				{ID: 8, Platform: "TikTok Shop", Name: "Realisasi Omset TikTok Shop", Bobot: 15, Target: 100000000, Type: "higher_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 9, Platform: "TikTok Shop", Name: "Efisiensi Biaya Iklan TikTok Shop", Bobot: 10, Target: 20000000, Type: "lower_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
			},
			BonusSchemes: []InitialBonusScheme{
				{ID: 1, Name: "Bad Perform 1", Threshold: 500000000, Multiplier: 8},
				{ID: 2, Name: "Average 1", Threshold: 975000000, Multiplier: 13},
				{ID: 3, Name: "Excellent 1", Threshold: 1950000000, Multiplier: 19},
			},
			KpiIndicators: []InitialKpiIndicator{
				{ID: 1, Name: "Bad Perform", Threshold: -25, Color: "bg-red-600"},
				{ID: 2, Name: "Under Perform", Threshold: 40, Color: "bg-pink-500"},
				{ID: 3, Name: "Average", Threshold: 60, Color: "bg-yellow-500"},
				{ID: 4, Name: "Good", Threshold: 80, Color: "bg-blue-500"},
				{ID: 5, Name: "Excellent", Threshold: 100, Color: "bg-green-500"},
			},
		},
		"SPV Advertiser": {
			BonusCalculationMethod: "OMSET_BASED",
			Employees: []InitialEmployee{
				{ID: 201, Name: "Rina Wijaya"},
			},
			KpiConfigs: []InitialKpiConfig{
				{ID: 10, Platform: "Tim", Name: "Total Omset Tim", Bobot: 40, Target: 1000000000, Type: "higher_is_better", IsCurrency: true, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 11, Platform: "Tim", Name: "Profitabilitas Tim (%)", Bobot: 40, Target: 20, Type: "higher_is_better", IsCurrency: false, IsPercentage: true, PointCapping: "uncapped"},
				{ID: 12, Platform: "Tim", Name: "Pertumbuhan Advertiser Baru", Bobot: 20, Target: 2, Type: "higher_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "uncapped"},
			},
			BonusSchemes: []InitialBonusScheme{
				{ID: 1, Name: "Bad Perform 1", Threshold: 500000000, Multiplier: 8},
				{ID: 2, Name: "Average 1", Threshold: 975000000, Multiplier: 13},
				{ID: 3, Name: "Excellent 1", Threshold: 1950000000, Multiplier: 19},
			},
			KpiIndicators: []InitialKpiIndicator{
				{ID: 1, Name: "Bad Perform", Threshold: -25, Color: "bg-red-600"},
				{ID: 2, Name: "Under Perform", Threshold: 40, Color: "bg-pink-500"},
				{ID: 3, Name: "Average", Threshold: 60, Color: "bg-yellow-500"},
				{ID: 4, Name: "Good", Threshold: 80, Color: "bg-blue-500"},
				{ID: 5, Name: "Excellent", Threshold: 100, Color: "bg-green-500"},
			},
		},
		"Tim Kreatif": {
			BonusCalculationMethod: "POINTS_BASED",
			Employees: []InitialEmployee{
				{ID: 301, Name: "Andi Desainer"},
				{ID: 302, Name: "Ria Videographer"},
			},
			KpiConfigs: []InitialKpiConfig{
				{ID: 19, Platform: "Produksi", Name: "Jumlah Aset Selesai (per bulan)", Bobot: 30, Target: 80, Type: "higher_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 20, Platform: "Kualitas", Name: "Tingkat Revisi Rata-rata", Bobot: 25, Target: 1.5, Type: "lower_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 21, Platform: "Kualitas", Name: "Skor Kualitas Internal (skala 1-5)", Bobot: 20, Target: 4.5, Type: "higher_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "capped"},
				{ID: 22, Platform: "Performa Iklan", Name: "Rata-rata CTR Aset Iklan", Bobot: 25, Target: 2, Type: "higher_is_better", IsCurrency: false, IsPercentage: true, PointCapping: "uncapped"},
			},
			BonusSchemes: []InitialBonusScheme{
				{ID: 101, Name: "Good", Threshold: 80, Multiplier: 10},
				{ID: 102, Name: "Excellent", Threshold: 95, Multiplier: 15},
				{ID: 103, Name: "Outstanding", Threshold: 105, Multiplier: 20},
			},
			KpiIndicators: []InitialKpiIndicator{
				{ID: 1, Name: "Bad Perform", Threshold: -25, Color: "bg-red-600"},
				{ID: 2, Name: "Under Perform", Threshold: 40, Color: "bg-pink-500"},
				{ID: 3, Name: "Average", Threshold: 60, Color: "bg-yellow-500"},
				{ID: 4, Name: "Good", Threshold: 80, Color: "bg-blue-500"},
				{ID: 5, Name: "Excellent", Threshold: 100, Color: "bg-green-500"},
			},
		},
		"Admin Support": {
			BonusCalculationMethod: "NON_SALES",
			Employees: []InitialEmployee{
				{ID: 401, Name: "Dewi Admin"},
			},
			KpiConfigs: []InitialKpiConfig{
				{ID: 30, Platform: "Administrasi", Name: "Kecepatan Respon Laporan (jam)", Bobot: 30, Target: 2, Type: "lower_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "uncapped"},
				{ID: 31, Platform: "Administrasi", Name: "Akurasi Data Entry (%)", Bobot: 30, Target: 99, Type: "higher_is_better", IsCurrency: false, IsPercentage: true, PointCapping: "uncapped"},
				{ID: 32, Platform: "Administrasi", Name: "Penyelesaian Tugas Tepat Waktu (%)", Bobot: 25, Target: 95, Type: "higher_is_better", IsCurrency: false, IsPercentage: true, PointCapping: "uncapped"},
				{ID: 33, Platform: "Dukungan", Name: "Jumlah Tiket Dukungan Terselesaikan", Bobot: 15, Target: 50, Type: "higher_is_better", IsCurrency: false, IsPercentage: false, PointCapping: "uncapped"},
			},
			BonusSchemes:  []InitialBonusScheme{}, // Empty for NON_SALES
			KpiIndicators: []InitialKpiIndicator{
				{ID: 1, Name: "Bad Perform", Threshold: -25, Color: "bg-red-600"},
				{ID: 2, Name: "Under Perform", Threshold: 40, Color: "bg-pink-500"},
				{ID: 3, Name: "Average", Threshold: 60, Color: "bg-yellow-500"},
				{ID: 4, Name: "Good", Threshold: 80, Color: "bg-blue-500"},
				{ID: 5, Name: "Excellent", Threshold: 100, Color: "bg-green-500"},
			},
		},
	}

	log.Println("Seeding database with initial data...")

	// Create divisions and seed each with its data
	for divisionName, divData := range initialData {
		division := Division{
			Name:                   divisionName,
			BonusCalculationMethod: divData.BonusCalculationMethod,
			CostKeywords:           "biaya,cost,spend,ads,iklan", // Default keywords
		}
		if err := db.Create(&division).Error; err != nil {
			log.Printf("Failed to create division %s: %v", divisionName, err)
			continue
		}

		// Seed employees
		for _, emp := range divData.Employees {
			employee := Employee{
				ID:         uint(emp.ID),
				DivisionID: division.ID,
				Name:       emp.Name,
			}
			if err := db.Create(&employee).Error; err != nil {
				log.Printf("Failed to create employee %s: %v", emp.Name, err)
			}
		}

		// Seed KPI configs
		for _, kpi := range divData.KpiConfigs {
			kpiConfig := KpiConfig{
				ID:           uint(kpi.ID),
				DivisionID:   division.ID,
				Platform:     kpi.Platform,
				Name:         kpi.Name,
				Bobot:        kpi.Bobot,
				Target:       kpi.Target,
				MinTarget:    kpi.MinTarget,
				Type:         kpi.Type,
				IsCurrency:   kpi.IsCurrency,
				IsPercentage: kpi.IsPercentage,
				SpecialCalc:  kpi.SpecialCalc,
				PointCapping: kpi.PointCapping,
			}
			if err := db.Create(&kpiConfig).Error; err != nil {
				log.Printf("Failed to create KPI config %s: %v", kpi.Name, err)
			}
		}

		// Seed bonus schemes
		for _, scheme := range divData.BonusSchemes {
			bonusScheme := BonusScheme{
				ID:         uint(scheme.ID),
				DivisionID: division.ID,
				Name:       scheme.Name,
				Threshold:  scheme.Threshold,
				Multiplier: scheme.Multiplier,
			}
			if err := db.Create(&bonusScheme).Error; err != nil {
				log.Printf("Failed to create bonus scheme %s: %v", scheme.Name, err)
			}
		}

		// Seed KPI indicators
		for _, indicator := range divData.KpiIndicators {
			kpiIndicator := KpiIndicator{
				ID:         uint(indicator.ID),
				DivisionID: division.ID,
				Name:       indicator.Name,
				Threshold:  indicator.Threshold,
				Color:      indicator.Color,
			}
			if err := db.Create(&kpiIndicator).Error; err != nil {
				log.Printf("Failed to create KPI indicator %s: %v", indicator.Name, err)
			}
		}

		log.Printf("Seeded division: %s with %d employees, %d KPIs, %d schemes, %d indicators",
			divisionName, len(divData.Employees), len(divData.KpiConfigs), len(divData.BonusSchemes), len(divData.KpiIndicators))
	}

	log.Println("Database seeding completed successfully!")
}

// Helper functions
func ptrFloat64(f float64) *float64 {
	return &f
}

func ptrString(s string) *string {
	return &s
}