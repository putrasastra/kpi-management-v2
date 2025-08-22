package main

import (
	"time"
)

type Division struct {
	ID                      uint      `json:"id" gorm:"primarykey"`
	Name                    string    `json:"name"`
	BonusCalculationMethod  string    `json:"bonusCalculationMethod"` // OMSET_BASED | POINTS_BASED | NON_SALES
	CostKeywords            string    `json:"costKeywords"`           // comma-separated optional
	CreatedAt               time.Time `json:"createdAt"`
	UpdatedAt               time.Time `json:"updatedAt"`
}

type Employee struct {
	ID         uint      `json:"id" gorm:"primarykey"`
	DivisionID uint      `json:"divisionId"`
	Name       string    `json:"name"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type BonusScheme struct {
	ID         uint      `json:"id" gorm:"primarykey"`
	DivisionID uint      `json:"divisionId"`
	Name       string    `json:"name"`
	Threshold  float64   `json:"threshold"`
	Multiplier float64   `json:"multiplier"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type KpiIndicator struct {
	ID         uint      `json:"id" gorm:"primarykey"`
	DivisionID uint      `json:"divisionId"`
	Name       string    `json:"name"`
	Threshold  float64   `json:"threshold"`
	Color      string    `json:"color"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type KpiConfig struct {
	ID           uint      `json:"id" gorm:"primarykey"`
	DivisionID   uint      `json:"divisionId"`
	Platform     string    `json:"platform"`
	Name         string    `json:"name"`
	Bobot        float64   `json:"bobot"`
	Target       float64   `json:"target"`
	MinTarget    *float64  `json:"minTarget"`
	Type         string    `json:"type"`        // higher_is_better | lower_is_better
	IsCurrency   bool      `json:"isCurrency"`
	IsPercentage bool      `json:"isPercentage"`
	SpecialCalc  *string   `json:"specialCalc"` // ROAS or null
	PointCapping string    `json:"pointCapping"` // uncapped | capped
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type HistoryEntry struct {
	ID             uint      `json:"id" gorm:"primarykey"`
	DivisionID     uint      `json:"divisionId"`
	EmployeeID     uint      `json:"employeeId"`
	EmployeeName   string    `json:"employeeName"`
	Date           time.Time `json:"date"`
	PeriodMonth    string    `json:"periodMonth"`
	PeriodYear     int       `json:"periodYear"`
	TotalPoints    float64   `json:"totalPoints"`
	Bonus          float64   `json:"bonus"`
	PDFDataURI     *string   `json:"pdfDataUri"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
}

// Calculation types used by /calculate endpoint

type KpiResultDetail struct {
	ID        uint    `json:"id"`
	Score     float64 `json:"score"`
	Poin      float64 `json:"poin"`
	Realisasi float64 `json:"realisasi"`
}

type CalculationResult struct {
	GrandTotalPoin     float64          `json:"grandTotalPoin"`
	FinalBonus         float64          `json:"finalBonus"`
	ActiveMultiplier   float64          `json:"activeMultiplier"`
	KpiIndicator       map[string]any   `json:"kpiIndicator"`
	OmsetIndicator     map[string]any   `json:"omsetIndicator"`
	TotalOmsetRealisasi float64         `json:"totalOmsetRealisasi"`
	TotalOmsetTarget   float64          `json:"totalOmsetTarget"`
	Details            []KpiResultDetail `json:"details"`
}

type CalculateRequest struct {
	KpiConfigs            []KpiConfig        `json:"kpiConfigs"`
	BonusSchemes          []BonusScheme      `json:"bonusSchemes"`
	KpiIndicators         []KpiIndicator     `json:"kpiIndicators"`
	RealisasiInputs       map[uint]string    `json:"realisasiInputs"`
	BonusCalculationMethod string            `json:"bonusCalculationMethod"`
	CustomCostKeywords    []string           `json:"customCostKeywords"`
}