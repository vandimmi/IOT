const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [{
            label: 'Khói',
            data: [20, 40, 50, 60, 45, 50, 70],
            borderColor: '#1e3a8a',
            fill: false,
            tension: 0.3
        },
        {
            label: 'Nhiệt độ',
            data: [30, 35, 40, 38, 45, 48, 50],
            borderColor: '#f59e0b',
            fill: false,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

// Water level update
function updateWaterLevel(level) {
    document.getElementById('water').style.height = level + '%';
    document.getElementById('gauge-text').innerText = level + '%';
}

// Example: auto update every 3s
let level = 60;
setInterval(() => {
    level = Math.floor(Math.random() * 101); // random 0-100%
    updateWaterLevel(level);
}, 3000);