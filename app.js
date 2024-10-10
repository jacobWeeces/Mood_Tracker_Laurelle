// app.js

// Define initial mood data if needed
const initialData = [
  {
    date: '2024-10-09',
    entries: [
      { time: '20:00', mood: 5, notes: '' },
    ],
  },
];

// Load initial data if not already present
if (!localStorage.getItem('moodData')) {
  localStorage.setItem('moodData', JSON.stringify(initialData));
}

// Rest of the JavaScript code to display and handle the chart...
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('moodForm')) {
    // Check if we are editing an existing entry
    const editDate = localStorage.getItem('editDate');
    const editIndex = localStorage.getItem('editIndex');

    if (editDate && editIndex !== null) {
      loadEditData(editDate, editIndex);
    }

    document.getElementById('moodForm').addEventListener('submit', saveMoodEntry);
  }

  if (document.getElementById('moodChart')) {
    displayMoodChart();
  }

  if (document.getElementById('moodTable')) {
    displayDayDetails();
  }
});

function loadEditData(date, index) {
  let data = JSON.parse(localStorage.getItem('moodData')) || [];
  let dayData = data.find((d) => d.date === date);

  if (dayData && dayData.entries[index]) {
    const entry = dayData.entries[index];
    document.getElementById('date').value = date;
    document.getElementById('time').value = entry.time;
    document.getElementById('mood').value = entry.mood;
    document.getElementById('notes').value = entry.notes;

    // Change the form title to indicate editing mode
    document.getElementById('inputTitle').textContent = 'Edit Mood Data';
  }
}

// Function to calculate daily averages for the chart
function calculateDailyAverages() {
  let data = JSON.parse(localStorage.getItem('moodData')) || [];
  let dates = [];
  let averageMoods = [];

  data.forEach((day) => {
    dates.push(day.date);
    const moods = day.entries.map((entry) => entry.mood);
    const averageMood = moods.reduce((a, b) => a + b, 0) / moods.length;
    averageMoods.push(averageMood.toFixed(2));
  });

  return { dates, averageMoods };
}

// Function to display the mood chart on index.html
let moodChartInstance;
function displayMoodChart() {
  const { dates, averageMoods } = calculateDailyAverages();

  // Log data to check if it's being passed correctly
  console.log("Dates:", dates);
  console.log("Average Moods:", averageMoods);

  // Check if there is data to display
  if (dates.length === 0) {
    console.warn("No data available to display on the chart.");
    return;
  }

  const ctx = document.getElementById('moodChart').getContext('2d');

  // Destroy existing chart instance if it exists to prevent reuse of canvas
  if (moodChartInstance) {
    moodChartInstance.destroy();
  }

  moodChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          pointRadius: 5,
          pointHoverRadius: 10,
          hitRadius: 40,
          label: 'Average Mood Score',
          data: averageMoods,
          borderColor: '#D4BFFF', /* Misty Lavender for line color */
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          min: 0,
          max: 10,
          title: {
            display: true,
            text: 'Mood Score',
          },
        },
      },
      onClick: (e, elements) => {
        const points = moodChartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: false, radius: 990 }, false);
        if (points.length > 0) {
          const index = points[0].index;
          const selectedDate = dates[index];
          localStorage.setItem('selectedDate', selectedDate);
          location.href = 'day.html';
        }
      },
    },
  });
}

// Function to display daily mood details on day.html
function displayDayDetails() {
  console.log('displayDayDetails function called');

  // Get the selected date from localStorage
  const selectedDate = localStorage.getItem('selectedDate');
  
  // Set the title to include the selected date
  const dayTitle = document.getElementById('dayTitle');
  if (dayTitle && selectedDate) {
    dayTitle.textContent = `Mood Details for ${selectedDate}`;
  }

  // Retrieve the mood data from localStorage
  let data = JSON.parse(localStorage.getItem('moodData')) || [];
  
  // Find the entries for the selected date
  let dayData = data.find((d) => d.date === selectedDate);

  // If data exists for that day, populate the table
  if (dayData) {
    const table = document.getElementById('moodTable');

    if (table) {
      // Loop through each entry and add a row to the table
      dayData.entries.forEach((entry, index) => {
        const row = table.insertRow();
        row.insertCell(0).textContent = entry.time || 'N/A';
        row.insertCell(1).textContent = entry.mood;
        row.insertCell(2).textContent = entry.notes;

        // Add edit button
        const editCell = row.insertCell(3);
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => {
          localStorage.setItem('editDate', selectedDate);
          localStorage.setItem('editIndex', index);
          location.href = 'input.html';
        };
        editCell.appendChild(editButton);
      });
    }
  } else {
    alert('No data available for the selected date.');
    location.href = 'index.html';
  }
}

// Function to save mood entry from the form
function saveMoodEntry(event) {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const mood = parseFloat(document.getElementById('mood').value);
  const notes = document.getElementById('notes').value;

  const entry = { time, mood, notes };

  let data = JSON.parse(localStorage.getItem('moodData')) || [];
  let dayData = data.find((d) => d.date === date);

  // Check if we are editing an existing entry
  const editDate = localStorage.getItem('editDate');
  const editIndex = localStorage.getItem('editIndex');

  if (editDate && editIndex !== null && editDate === date) {
    // Update the existing entry
    dayData.entries[editIndex] = entry;

    // Clear edit mode
    localStorage.removeItem('editDate');
    localStorage.removeItem('editIndex');
  } else {
    // Add new entry
    if (dayData) {
      dayData.entries.push(entry);
    } else {
      data.push({ date, entries: [entry] });
    }
  }

  localStorage.setItem('moodData', JSON.stringify(data));
  alert('Mood entry saved!');
  event.target.reset();
  location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('themeToggle');
  
  // Set initial theme based on localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }
});

function setTheme(theme) {
  document.body.dataset.theme = theme;

  if (theme === 'dark') {
    document.body.style.backgroundColor = '#121212';
    document.body.style.color = '#E0E0E0';
    document.querySelectorAll('form, table').forEach((el) => {
      el.style.backgroundColor = '#1E1E1E';
    });
    document.querySelectorAll('input, textarea').forEach((el) => {
      el.style.backgroundColor = '#333333';
      el.style.color = '#E0E0E0';
    });
    document.querySelectorAll('button').forEach((el) => {
      el.style.backgroundColor = '#03DAC5';
      el.style.color = '#121212';
    });
  } else {
    document.body.style.backgroundColor = '#F5F5F7';
    document.body.style.color = '#3C3C3C';
    document.querySelectorAll('form, table').forEach((el) => {
      el.style.backgroundColor = '#FFF7E6';
    });
    document.querySelectorAll('input, textarea').forEach((el) => {
      el.style.backgroundColor = '#CFFFE5';
      el.style.color = '#3C3C3C';
    });
    document.querySelectorAll('button').forEach((el) => {
      el.style.backgroundColor = '#D4BFFF';
      el.style.color = '#121212';
    });
  }
}
