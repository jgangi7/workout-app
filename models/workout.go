package models

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite" // Pure Go SQLite driver
)

type Workout struct {
	ID     int       `json:"id"`
	Name   string    `json:"name"`
	Sets   int       `json:"sets"`
	Reps   int       `json:"reps"`
	Weight int       `json:"weight"`
	Notes  string    `json:"notes"`
	Date   time.Time `json:"date"`
}

type WorkoutDB struct {
	DB *sql.DB
}

func InitDB(dbPath string) (*WorkoutDB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// Create workouts table if it doesn't exist
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS workouts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		sets INTEGER NOT NULL,
		reps INTEGER NOT NULL,
		weight INTEGER NOT NULL,
		notes TEXT,
		date DATETIME NOT NULL
	);`

	_, err = db.Exec(createTableSQL)
	if err != nil {
		return nil, err
	}

	return &WorkoutDB{DB: db}, nil
}

// CreateWorkout inserts a new workout into the database
func (db *WorkoutDB) CreateWorkout(workout *Workout) error {
	query := `
	INSERT INTO workouts (name, sets, reps, weight, notes, date)
	VALUES (?, ?, ?, ?, ?, ?)`

	result, err := db.DB.Exec(query,
		workout.Name,
		workout.Sets,
		workout.Reps,
		workout.Weight,
		workout.Notes,
		workout.Date,
	)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	workout.ID = int(id)
	return nil
}

// GetWorkouts retrieves all workouts from the database
func (db *WorkoutDB) GetWorkouts() ([]Workout, error) {
	query := `SELECT id, name, sets, reps, weight, notes, date FROM workouts ORDER BY date DESC`
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workouts []Workout
	for rows.Next() {
		var w Workout
		err := rows.Scan(&w.ID, &w.Name, &w.Sets, &w.Reps, &w.Weight, &w.Notes, &w.Date)
		if err != nil {
			return nil, err
		}
		workouts = append(workouts, w)
	}
	return workouts, nil
}

// GetWorkout retrieves a single workout by ID
func (db *WorkoutDB) GetWorkout(id int) (*Workout, error) {
	query := `SELECT id, name, sets, reps, weight, notes, date FROM workouts WHERE id = ?`
	row := db.DB.QueryRow(query, id)

	var w Workout
	err := row.Scan(&w.ID, &w.Name, &w.Sets, &w.Reps, &w.Weight, &w.Notes, &w.Date)
	if err != nil {
		return nil, err
	}
	return &w, nil
}

// UpdateWorkout updates an existing workout
func (db *WorkoutDB) UpdateWorkout(workout *Workout) error {
	query := `
	UPDATE workouts 
	SET name = ?, sets = ?, reps = ?, weight = ?, notes = ?, date = ?
	WHERE id = ?`

	result, err := db.DB.Exec(query,
		workout.Name,
		workout.Sets,
		workout.Reps,
		workout.Weight,
		workout.Notes,
		workout.Date,
		workout.ID,
	)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}

// DeleteWorkout removes a workout from the database
func (db *WorkoutDB) DeleteWorkout(id int) error {
	query := `DELETE FROM workouts WHERE id = ?`
	result, err := db.DB.Exec(query, id)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return sql.ErrNoRows
	}

	return nil
}
