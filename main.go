package main

import (
	"log"
	"net/http"
	"workout-app/handlers"
	"workout-app/models"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize database
	db, err := models.InitDB("workouts.db")
	if err != nil {
		log.Fatal(err)
	}

	// Create handler
	workoutHandler := handlers.NewWorkoutHandler(db)

	// Create router
	r := mux.NewRouter()

	// Serve static files
	fs := http.FileServer(http.Dir("static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	// Serve index.html for the root path
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "static/index.html")
	})

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/workouts", workoutHandler.GetWorkouts).Methods("GET")
	api.HandleFunc("/workouts", workoutHandler.CreateWorkout).Methods("POST")
	api.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.GetWorkout).Methods("GET")
	api.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.UpdateWorkout).Methods("PUT")
	api.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.DeleteWorkout).Methods("DELETE")

	// Start server
	log.Println("Server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
