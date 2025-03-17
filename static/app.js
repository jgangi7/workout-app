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

// Load workouts when the page loads
document.addEventListener('DOMContentLoaded', loadWorkouts);

// Add workout form submission
document.getElementById('workoutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const workout = {
        name: document.getElementById('name').value,
        sets: parseInt(document.getElementById('sets').value),
        reps: parseInt(document.getElementById('reps').value),
        weight: parseInt(document.getElementById('weight').value),
        notes: document.getElementById('notes').value,
        date: new Date(document.getElementById('date').value).toISOString()
    };

    try {
        const response = await fetch('/api/workouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        if (response.ok) {
            document.getElementById('workoutForm').reset();
            loadWorkouts();
        } else {
            alert('Failed to add workout');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add workout');
    }
});

// Load all workouts
async function loadWorkouts() {
    try {
        const response = await fetch('/api/workouts');
        const workouts = await response.json();
        displayWorkouts(workouts);
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
            <div class="card workout-card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${workout.name}</h5>
                    <div class="workout-details">
                        <p class="mb-1">Sets: ${workout.sets} × Reps: ${workout.reps}</p>
                        <p class="mb-1">Weight: ${workout.weight} lbs</p>
                        ${workout.notes ? `<p class="mb-1">Notes: ${workout.notes}</p>` : ''}
                        <p class="workout-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="editWorkout(${workout.id})">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteWorkout(${workout.id})">Delete</button>
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
    const workout = {
        name: document.getElementById('editName').value,
        sets: parseInt(document.getElementById('editSets').value),
        reps: parseInt(document.getElementById('editReps').value),
        weight: parseInt(document.getElementById('editWeight').value),
        notes: document.getElementById('editNotes').value,
        date: new Date(document.getElementById('editDate').value).toISOString()
    };

    try {
        const response = await fetch(`/api/workouts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        });

        if (response.ok) {
            editModal.hide();
            loadWorkouts();
        } else {
            alert('Failed to update workout');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update workout');
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