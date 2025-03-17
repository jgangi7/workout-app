package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"workout-app/models"

	"github.com/gorilla/mux"
)

type WorkoutHandler struct {
	db *models.WorkoutDB
}

func NewWorkoutHandler(db *models.WorkoutDB) *WorkoutHandler {
	return &WorkoutHandler{db: db}
}

func (h *WorkoutHandler) CreateWorkout(w http.ResponseWriter, r *http.Request) {
	var workout models.Workout
	if err := json.NewDecoder(r.Body).Decode(&workout); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Set the date to current time if not provided
	if workout.Date.IsZero() {
		workout.Date = time.Now()
	}

	if err := h.db.CreateWorkout(&workout); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(workout)
}

func (h *WorkoutHandler) GetWorkouts(w http.ResponseWriter, r *http.Request) {
	workouts, err := h.db.GetWorkouts()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workouts)
}

func (h *WorkoutHandler) GetWorkout(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workout ID", http.StatusBadRequest)
		return
	}

	workout, err := h.db.GetWorkout(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workout)
}

func (h *WorkoutHandler) UpdateWorkout(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workout ID", http.StatusBadRequest)
		return
	}

	var workout models.Workout
	if err := json.NewDecoder(r.Body).Decode(&workout); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	workout.ID = id

	if err := h.db.UpdateWorkout(&workout); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workout)
}

func (h *WorkoutHandler) DeleteWorkout(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid workout ID", http.StatusBadRequest)
		return
	}

	if err := h.db.DeleteWorkout(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
