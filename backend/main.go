package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func main() {
	// Initialize DB (SQLite local file)
	var err error
	dbPath := "app.db"
	if v := os.Getenv("APP_DB_PATH"); v != "" { dbPath = v }
	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil { log.Fatalf("failed to connect database: %v", err) }

	if err := db.AutoMigrate(&Division{}, &Employee{}, &BonusScheme{}, &KpiIndicator{}, &KpiConfig{}, &HistoryEntry{}); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	// Seed database if empty
	SeedDatabase()

	r := gin.Default()
	// CORS for local dev
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == http.MethodOptions { c.AbortWithStatus(http.StatusNoContent); return }
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status":"ok"}) })

	// Basic CRUD minimal
	r.GET("/divisions", func(c *gin.Context) {
		var list []Division
		if err := db.Find(&list).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, list)
	})
	r.POST("/divisions", func(c *gin.Context) {
		var payload Division
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if payload.BonusCalculationMethod == "" { payload.BonusCalculationMethod = "OMSET_BASED" }
		if err := db.Create(&payload).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusCreated, payload)
	})

	r.GET("/employees", func(c *gin.Context) {
		var list []Employee
		q := db
		if did := c.Query("division_id"); did != "" { q = q.Where("division_id = ?", did) }
		if err := q.Find(&list).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, list)
	})
	r.POST("/employees", func(c *gin.Context) {
		var payload Employee
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if err := db.Create(&payload).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusCreated, payload)
	})

	r.GET("/kpis", func(c *gin.Context) {
		var list []KpiConfig
		q := db
		if did := c.Query("division_id"); did != "" { q = q.Where("division_id = ?", did) }
		if err := q.Find(&list).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, list)
	})
	r.POST("/kpis", func(c *gin.Context) {
		var payload KpiConfig
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if payload.PointCapping == "" { payload.PointCapping = "uncapped" }
		if payload.Type == "" { payload.Type = "higher_is_better" }
		if err := db.Create(&payload).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusCreated, payload)
	})

	r.GET("/schemes", func(c *gin.Context) {
		var list []BonusScheme
		q := db
		if did := c.Query("division_id"); did != "" { q = q.Where("division_id = ?", did) }
		if err := q.Find(&list).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, list)
	})
	r.POST("/schemes", func(c *gin.Context) {
		var payload BonusScheme
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if err := db.Create(&payload).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusCreated, payload)
	})

	r.GET("/indicators", func(c *gin.Context) {
		var list []KpiIndicator
		q := db
		if did := c.Query("division_id"); did != "" { q = q.Where("division_id = ?", did) }
		if err := q.Find(&list).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusOK, list)
	})
	r.POST("/indicators", func(c *gin.Context) {
		var payload KpiIndicator
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		if err := db.Create(&payload).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.JSON(http.StatusCreated, payload)
	})

	// Calculate endpoint
	r.POST("/calculate", func(c *gin.Context) {
		var req CalculateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		res := CalculateBonus(req.KpiConfigs, req.BonusSchemes, req.KpiIndicators, req.RealisasiInputs, req.BonusCalculationMethod, req.CustomCostKeywords)
		c.JSON(http.StatusOK, res)
	})

	// History endpoints
	// Response DTO
	type HistoryResponse struct {
		ID           uint              `json:"id"`
		DivisionID   uint              `json:"divisionId"`
		EmployeeID   uint              `json:"employeeId"`
		EmployeeName string            `json:"employeeName"`
		Date         time.Time         `json:"date"`
		PeriodMonth  string            `json:"periodMonth"`
		PeriodYear   int               `json:"periodYear"`
		TotalPoints  float64           `json:"totalPoints"`
		Bonus        float64           `json:"bonus"`
		Results      CalculationResult `json:"results"`
		PDFDataURI   *string           `json:"pdfDataUri"`
	}
	// GET /history with filters: division_id or division_name, optional employee_id, month, year
	r.GET("/history", func(c *gin.Context) {
		q := db.Model(&HistoryEntry{})
		if dn := c.Query("division_name"); dn != "" {
			var div Division
			if err := db.Where("name = ?", dn).First(&div).Error; err == nil {
				q = q.Where("division_id = ?", div.ID)
			}
		}
		if did := c.Query("division_id"); did != "" { q = q.Where("division_id = ?", did) }
		if eid := c.Query("employee_id"); eid != "" { q = q.Where("employee_id = ?", eid) }
		if pm := c.Query("period_month"); pm != "" { q = q.Where("period_month = ?", pm) }
		if py := c.Query("period_year"); py != "" { q = q.Where("period_year = ?", py) }

		var items []HistoryEntry
		if err := q.Order("created_at desc").Find(&items).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		responses := make([]HistoryResponse, 0, len(items))
		for _, it := range items {
			var res CalculationResult
			if it.ResultsJSON != "" { _ = json.Unmarshal([]byte(it.ResultsJSON), &res) }
			responses = append(responses, HistoryResponse{
				ID: it.ID, DivisionID: it.DivisionID, EmployeeID: it.EmployeeID, EmployeeName: it.EmployeeName,
				Date: it.Date, PeriodMonth: it.PeriodMonth, PeriodYear: it.PeriodYear,
				TotalPoints: it.TotalPoints, Bonus: it.Bonus, Results: res, PDFDataURI: it.PDFDataURI,
			})
		}
		c.JSON(http.StatusOK, responses)
	})

	// POST /history create
	type HistoryCreateRequest struct {
		DivisionID   uint              `json:"divisionId"`
		DivisionName string            `json:"divisionName"`
		EmployeeID   uint              `json:"employeeId"`
		EmployeeName string            `json:"employeeName"`
		Date         string            `json:"date"`
		PeriodMonth  string            `json:"periodMonth"`
		PeriodYear   int               `json:"periodYear"`
		TotalPoints  float64           `json:"totalPoints"`
		Bonus        float64           `json:"bonus"`
		Results      CalculationResult `json:"results"`
		PDFDataURI   *string           `json:"pdfDataUri"`
	}
	
	r.POST("/history", func(c *gin.Context) {
		var req HistoryCreateRequest
		if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }

		var divisionID uint = req.DivisionID
		if divisionID == 0 && strings.TrimSpace(req.DivisionName) != "" {
			var div Division
			if err := db.Where("name = ?", req.DivisionName).First(&div).Error; err == nil {
				divisionID = div.ID
			}
		}
		if divisionID == 0 { c.JSON(http.StatusBadRequest, gin.H{"error":"divisionId or valid divisionName is required"}); return }

		// Check duplicate: per division, employee, period
		var cnt int64
		if err := db.Model(&HistoryEntry{}).Where("division_id=? AND employee_id=? AND period_month=? AND period_year=?",
			divisionID, req.EmployeeID, req.PeriodMonth, req.PeriodYear).Count(&cnt).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
		}
		if cnt > 0 { c.JSON(http.StatusConflict, gin.H{"error":"duplicate history for employee and period"}); return }

		parsedDate := time.Now()
		if t, err := time.Parse(time.RFC3339, req.Date); err == nil { parsedDate = t }

		b, err := json.Marshal(req.Results)
		if err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": "invalid results payload"}); return }

		entry := HistoryEntry{
			DivisionID:   divisionID,
			EmployeeID:   req.EmployeeID,
			EmployeeName: req.EmployeeName,
			Date:         parsedDate,
			PeriodMonth:  req.PeriodMonth,
			PeriodYear:   req.PeriodYear,
			TotalPoints:  req.TotalPoints,
			Bonus:        req.Bonus,
			ResultsJSON:  string(b),
			PDFDataURI:   req.PDFDataURI,
		}
		if err := db.Create(&entry).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }

		// Build response
		resp := HistoryResponse{
			ID: entry.ID, DivisionID: entry.DivisionID, EmployeeID: entry.EmployeeID, EmployeeName: entry.EmployeeName,
			Date: entry.Date, PeriodMonth: entry.PeriodMonth, PeriodYear: entry.PeriodYear,
			TotalPoints: entry.TotalPoints, Bonus: entry.Bonus, Results: req.Results, PDFDataURI: entry.PDFDataURI,
		}
		c.JSON(http.StatusCreated, resp)
	})

	// DELETE /history/:id
	r.DELETE("/history/:id", func(c *gin.Context) {
		id := c.Param("id")
		if err := db.Delete(&HistoryEntry{}, id).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.Status(http.StatusNoContent)
	})

	// Utility endpoint to update division cost keywords
	r.PUT("/divisions/:id/cost-keywords", func(c *gin.Context) {
		id := c.Param("id")
		var payload struct{ Keywords []string `json:"keywords"` }
		if err := c.ShouldBindJSON(&payload); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
		csv := strings.Join(payload.Keywords, ",")
		if err := db.Model(&Division{}).Where("id = ?", id).Update("cost_keywords", csv).Error; err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
		c.Status(http.StatusNoContent)
	})

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	log.Printf("Go backend running on http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil { log.Fatal(err) }
}