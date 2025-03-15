package models

import "time"

type Workout struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Duration    int       `json:"duration"` // in minutes
	Date        time.Time `json:"date"`
	Type        string    `json:"type"` // e.g., "strength", "cardio", "flexibility"
	CreatedAt   time.Time `json:"created_at"`
}

type WorkoutDB struct {
	DB interface{} // This will hold our database connection
}

func InitDB(dbPath string) (*WorkoutDB, error) {
	// TODO: Implement database initialization
	return &WorkoutDB{}, nil
}
