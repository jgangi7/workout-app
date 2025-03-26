// Dark mode toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        darkModeToggle.checked = true;
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('darkMode', 'false');
        }
    });
});

// Initialize Bootstrap modal
const editModal = new bootstrap.Modal(document.getElementById('editModal'));
const progressModal = new bootstrap.Modal(document.getElementById('progressModal'));
let progressChart = null;

// Load workouts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadWorkouts();
    
    // Auto-fill current date and time
    const now = new Date();
    const dateInput = document.getElementById('date');
    dateInput.value = now.toISOString().slice(0, 16);
});

// Function to update PR displays
function updatePRs(workouts) {
    const liftMaxes = {
        'Squat': 0,
        'Bench': 0,
        'Deadlift': 0
    };

    // Find max weight for each lift
    workouts.forEach(workout => {
        const name = workout.name.trim().toLowerCase();
        if (name === 'squat' && workout.weight > liftMaxes['Squat']) {
            liftMaxes['Squat'] = workout.weight;
        } else if (name === 'bench' && workout.weight > liftMaxes['Bench']) {
            liftMaxes['Bench'] = workout.weight;
        } else if (name === 'deadlift' && workout.weight > liftMaxes['Deadlift']) {
            liftMaxes['Deadlift'] = workout.weight;
        }
    });

    // Update display for individual lifts
    document.getElementById('maxSquat').textContent = liftMaxes['Squat'] > 0 ? `${liftMaxes['Squat']} lbs` : '--';
    document.getElementById('maxBench').textContent = liftMaxes['Bench'] > 0 ? `${liftMaxes['Bench']} lbs` : '--';
    document.getElementById('maxDeadlift').textContent = liftMaxes['Deadlift'] > 0 ? `${liftMaxes['Deadlift']} lbs` : '--';

    // Calculate total from the maxes that exist (will be 0 if not recorded)
    const total = liftMaxes['Squat'] + liftMaxes['Bench'] + liftMaxes['Deadlift'];
    
    // Only display total if at least one lift has been recorded
    document.getElementById('totalWeight').textContent = total > 0 ? `${total} lbs` : '--';
}

// Add workout form submission
document.getElementById('workoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get and validate form values
    const name = document.getElementById('name').value.trim();
    const sets = parseInt(document.getElementById('sets').value);
    const reps = parseInt(document.getElementById('reps').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const notes = document.getElementById('notes').value.trim();
    const date = document.getElementById('date').value;

    // Validate required fields
    if (!name || !sets || !reps || !weight || !date) {
        alert('Please fill in all required fields');
        return;
    }

    // Validate numeric ranges
    if (sets < 1 || sets > 20) {
        alert('Sets must be between 1 and 20');
        return;
    }

    if (reps < 1 || reps > 100) {
        alert('Reps must be between 1 and 100');
        return;
    }

    if (weight < 0 || weight > 1000) {
        alert('Weight must be between 0 and 1000 lbs');
        return;
    }

    // Format date to match the expected format (YYYY-MM-DDTHH:mm:ssZ)
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString();

    const workout = {
        name,
        sets,
        reps,
        weight,
        notes,
        date: formattedDate
    };

    try {
        console.log('Sending workout data:', workout); // Debug log
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        // Clone the response so we can read it multiple times if needed
        const responseClone = response.clone();

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || 'Failed to add workout';
            } catch (e) {
                // If response is not JSON, get text content
                errorMessage = await responseClone.text();
            }
            console.error('Server error:', errorMessage); // Debug log
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Success:', result); // Debug log
        
        document.getElementById('workoutForm').reset();
        loadWorkouts();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to add workout');
    }
});

// Load all workouts
async function loadWorkouts() {
    try {
        const response = await fetch('/api/workouts');
        const workouts = await response.json();
        displayWorkouts(workouts);
        updatePRs(workouts);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load workouts');
    }
}

// Display workouts in the UI
function displayWorkouts(workouts) {
    const workoutsList = document.getElementById('workoutsList');
    workoutsList.innerHTML = '';

    workouts.forEach(workout => {
        const date = new Date(workout.date);
        const card = document.createElement('div');
        card.className = 'col-md-6';
        card.innerHTML = `
            <div class="card workout-card mb-3" style="cursor: pointer;" onclick="showProgress('${workout.name}', ${workout.id})">
                <div class="card-body">
                    <h5 class="card-title">${workout.name}</h5>
                    <div class="workout-details">
                        <p class="mb-1">Sets: ${workout.sets} × Reps: ${workout.reps}</p>
                        <p class="mb-1">Weight: ${workout.weight} lbs</p>
                        ${workout.notes ? `<p class="mb-1">Notes: ${workout.notes}</p>` : ''}
                        <p class="workout-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); editWorkout(${workout.id})">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); deleteWorkout(${workout.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
        workoutsList.appendChild(card);
    });
}

// Edit workout
async function editWorkout(id) {
    try {
        const response = await fetch(`/api/workouts/${id}`);
        const workout = await response.json();
        
        document.getElementById('editId').value = workout.id;
        document.getElementById('editName').value = workout.name;
        document.getElementById('editSets').value = workout.sets;
        document.getElementById('editReps').value = workout.reps;
        document.getElementById('editWeight').value = workout.weight;
        document.getElementById('editNotes').value = workout.notes;
        document.getElementById('editDate').value = new Date(workout.date).toISOString().slice(0, 16);
        
        editModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load workout details');
    }
}

// Save edited workout
document.getElementById('saveEdit').addEventListener('click', async () => {
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    
    // Format date to match SQLite DATETIME format
    const formattedDate = new Date(date).toISOString().replace('T', ' ').replace('Z', '');

    const workout = {
        name: document.getElementById('editName').value,
        sets: parseInt(document.getElementById('editSets').value),
        reps: parseInt(document.getElementById('editReps').value),
        weight: parseInt(document.getElementById('editWeight').value),
        notes: document.getElementById('editNotes').value,
        date: formattedDate
    };

    try {
        console.log('Sending updated workout data:', workout); // Debug log
        const response = await fetch(`/api/workouts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData); // Debug log
            throw new Error(errorData.error || 'Failed to update workout');
        }

        const result = await response.json();
        console.log('Success:', result); // Debug log
        
        editModal.hide();
        loadWorkouts();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to update workout');
    }
});

// Delete workout
async function deleteWorkout(id) {
    if (!confirm('Are you sure you want to delete this workout?')) {
        return;
    }

    try {
        const response = await fetch(`/api/workouts/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadWorkouts();
        } else {
            alert('Failed to delete workout');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete workout');
    }
}

// Show progress chart
async function showProgress(exerciseName, currentId) {
    try {
        const response = await fetch('/api/workouts');
        const workouts = await response.json();
        
        // Filter workouts for the same exercise and sort by date
        const exerciseWorkouts = workouts
            .filter(w => w.name.toLowerCase() === exerciseName.toLowerCase())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        if (exerciseWorkouts.length === 0) {
            alert('No previous workouts found for this exercise');
            return;
        }

        // Prepare data for the chart
        const dates = exerciseWorkouts.map(w => new Date(w.date).toLocaleDateString());
        const weights = exerciseWorkouts.map(w => w.weight);

        // Destroy existing chart if it exists
        if (progressChart) {
            progressChart.destroy();
        }

        // Create new chart
        const ctx = document.getElementById('progressChart').getContext('2d');
        progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `${exerciseName} Weight Progress`,
                    data: weights,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Weight (lbs)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });

        progressModal.show();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load progress data');
    }
} 