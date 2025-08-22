package main

import (
	"log"
	"net/http"
	"os"
	"strings"

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

	// Calculation endpoint
	r.POST("/calculate", func(c *gin.Context) {
		var req CalculateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		res := CalculateBonus(req.KpiConfigs, req.BonusSchemes, req.KpiIndicators, req.RealisasiInputs, req.BonusCalculationMethod, req.CustomCostKeywords)
		c.JSON(http.StatusOK, res)
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