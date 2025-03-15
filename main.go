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

	// Register routes
	r.HandleFunc("/workouts", workoutHandler.GetWorkouts).Methods("GET")
	r.HandleFunc("/workouts", workoutHandler.CreateWorkout).Methods("POST")
	r.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.GetWorkout).Methods("GET")
	r.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.UpdateWorkout).Methods("PUT")
	r.HandleFunc("/workouts/{id:[0-9]+}", workoutHandler.DeleteWorkout).Methods("DELETE")

	// Set router as default handler
	http.Handle("/", r)

	// Start server
	log.Println("Server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
