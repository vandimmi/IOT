console.log("✅ Dashboard loaded at " + new Date().toLocaleString());
const apiUrl = 'http://localhost:8080/api/in4-arduino/latest?limit=100000';
const token = localStorage.getItem('token');

async function fetchSensorData() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) throw new Error("Failed to fetch sensor data");

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid data format");

        updateChart(data);
        updateTable(data);

    } catch (err) {
        console.error("❌ Error fetching data:", err);
    }
}

// 📊 Vẽ biểu đồ từ dữ liệu
let chart; // biến toàn cục

function updateChart(data) {
    const latest100 = data.slice(-100);
    const labels = latest100.map(entry => new Date(entry.createdAt).toLocaleTimeString());
    const mq2 = latest100.map(e => e.mq2);
    const mq7 = latest100.map(e => e.mq7);
    const mq135 = latest100.map(e => e.mq135);
    const temp = latest100.map(e => e.temperature);

    if (!chart) {
        // tạo chart lần đầu
        const ctx = document.getElementById('myChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'MQ2',
                        data: mq2,
                        borderColor: '#1e3a8a',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'MQ7',
                        data: mq7,
                        borderColor: '#2563eb',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'MQ135',
                        data: mq135,
                        borderColor: '#4f46e5',
                        fill: false,
                        tension: 0.3
                    },
                    {
                        label: 'Temp',
                        data: temp,
                        borderColor: '#f59e0b',
                        fill: false,
                        tension: 0.3
                    }
                ]
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
    } else {
        // cập nhật chart
        chart.data.labels = labels;
        chart.data.datasets[0].data = mq2;
        chart.data.datasets[1].data = mq7;
        chart.data.datasets[2].data = mq135;
        chart.data.datasets[3].data = temp;
        chart.update();
    }
}



// 🧾 Đổ dữ liệu vào bảng
function updateTable(data) {
    const table = document.querySelector('table');

    // Xóa tất cả các dòng cũ trừ header
    const oldRows = table.querySelectorAll("tr:not(:first-child)");
    oldRows.forEach(row => row.remove());

    // Lấy 100 dòng mới nhất đã được sort từ backend (không cần reverse)
    const rows = data.slice(0, 100);

    rows.forEach((entry, index) => {
        const tr = document.createElement('tr');

        const no = document.createElement('td');
        no.textContent = index + 1;

        const id = document.createElement('td');
        id.textContent = `#${entry._id.slice(-6)}`;

        const date = document.createElement('td');
        const d = new Date(entry.createdAt);
        date.textContent = d.toLocaleString();

        const message = document.createElement('td');
        if (entry.flame === 0) {
            message.textContent = 'Phát hiện có lửa 🔥';
        } else if (entry.temperature > 60) {
            message.textContent = 'Nhiệt độ cao';
        } else if (entry.mq2 > 600) {
            message.textContent = 'Khói dày đặc';
        } else {
            message.textContent = 'Dữ liệu ổn định';
        }

        tr.append(no, id, date, message);
        table.appendChild(tr);
    });
}


// 💧 Giả lập mực nước (sau bạn có thể lấy từ cảm biến)
function updateWaterLevel(level) {
    document.getElementById('water').style.height = level + '%';
    document.getElementById('gauge-text').innerText = level + '%';
}

// Khởi động
fetchSensorData();
document.body.style.display = 'block';
setInterval(() => {
    const level = Math.floor(Math.random() * 101);
    updateWaterLevel(level);
}, 3000);
