# Workout Tracker

A simple web application for tracking your workouts, built with Go and SQLite. This application allows you to record, view, edit, and delete your workout sessions with details like sets, reps, and weight.

## Features

- 📝 Add new workouts with:
  - Exercise name
  - Number of sets
  - Reps per set
  - Weight
  - Notes
  - Date and time
- 👀 View all workouts in a clean, card-based layout
- ✏️ Edit existing workouts
- 🗑️ Delete workouts
- 🌓 Dark mode support
- 💾 Persistent storage using SQLite
- 📱 Responsive design for mobile and desktop

## Prerequisites

- Go 1.21 or higher
- Git (for cloning the repository)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/workout-app.git
cd workout-app
```

2. Install dependencies:
```bash
go mod download
```

## Running the Application

1. Start the server:
```bash
go run main.go
```

2. Open your web browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
workout-app/
├── main.go           # Application entry point
├── models/           # Database models and operations
│   └── workout.go    # Workout model and database functions
├── handlers/         # HTTP request handlers
│   └── workout.go    # Workout-related handlers
├── static/          # Static files
│   ├── index.html   # Main HTML file
│   ├── styles.css   # CSS styles
│   └── app.js       # Frontend JavaScript
└── workouts.db      # SQLite database file
```

## API Endpoints

- `GET /api/workouts` - Get all workouts
- `POST /api/workouts` - Create a new workout
- `GET /api/workouts/{id}` - Get a specific workout
- `PUT /api/workouts/{id}` - Update a workout
- `DELETE /api/workouts/{id}` - Delete a workout

## Development

The application uses:
- Go for the backend
- SQLite for data storage
- Bootstrap 5 for styling
- Vanilla JavaScript for frontend functionality

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Bootstrap for the UI components
- Gorilla Mux for routing
- Modernc.org SQLite for the database driver 