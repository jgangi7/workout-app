# Workout App

A simple workout tracking application built with Go.

## Features

- Create, read, update, and delete workouts
- Track workout name, description, duration, type, and date
- RESTful API endpoints

## Setup

1. Install Go (version 1.21 or later)
2. Clone this repository
3. Install dependencies:
```bash
go mod download
```
4. Run the application:
```bash
go run main.go
```

The server will start on http://localhost:8080

## API Endpoints

- `GET /workouts` - List all workouts
- `POST /workouts` - Create a new workout
- `GET /workouts/{id}` - Get a specific workout
- `PUT /workouts/{id}` - Update a workout
- `DELETE /workouts/{id}` - Delete a workout

## Example Request

Create a new workout:
```bash
curl -X POST http://localhost:8080/workouts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Run",
    "description": "5k run in the park",
    "duration": 30,
    "type": "cardio",
    "date": "2024-03-14T08:00:00Z"
  }'
``` 