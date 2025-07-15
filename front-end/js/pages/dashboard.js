console.log("✅ Dashboard loaded at " + new Date().toLocaleString());
const apiUrl = 'http://localhost:8080/api/in4-arduino/latest?limit=100000';
const token = localStorage.getItem('token');

async function fetchAndUpdate() {
    const token = localStorage.getItem('token');
    const apiUrl = 'http://localhost:8080/api/in4-arduino/latest?limit=100';

    try {
        const res = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await res.json();
        const latest = data[data.length - 1];
        updateCards(latest);
        updateTable(data);  // Cập nhật mượt
        updateChart(data);  // Nếu cần vẽ lại biểu đồ

    } catch (e) {
        console.error("❌ Fetch error:", e);
    }
}

function updateCards(latest) {
    // latest là phần tử cuối cùng trong mảng (dữ liệu mới nhất)
    document.getElementById('value-mq2').innerText = latest.mq2;
    document.getElementById('value-mq7').innerText = latest.mq7;
    document.getElementById('value-mq135').innerText = latest.mq135;
    document.getElementById('value-temp').innerText = latest.temperature + '°C';

    // ⚠️ Nếu bạn có logic về thiết bị ON/OFF thì thêm ở đây
    const isNormal = latest.flame !== 0 && latest.temperature < 60 && latest.mq2 < 600;
    document.getElementById('value-status').innerText = isNormal ? 'Ổn định' : 'Cảnh báo';
}


// 📊 Vẽ biểu đồ từ dữ liệu
let chart; // biến toàn cục


function updateChart(data) {
    const latest100 = data.slice(-100).reverse(); // lấy 100 bản ghi mới nhất, đảo ngược để hiển thị gần nhất trên đầu
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
let lastEntryId = null;

function updateTable(data) {
    const table = document.querySelector('table');
    const latestRows = data.slice(-100); // giữ đúng 100 dòng mới nhất

    // Nếu không có dữ liệu hoặc không thay đổi gì thì bỏ qua
    if (latestRows.length === 0) return;
    const newestId = latestRows[latestRows.length - 1]._id;
    if (newestId === lastEntryId) return;

    // Xoá các dòng cũ (trừ dòng tiêu đề)
    const oldRows = table.querySelectorAll("tr:not(:first-child)");
    oldRows.forEach(row => row.remove());

    // Cập nhật bảng theo thứ tự thời gian TĂNG DẦN
    latestRows.forEach((entry, index) => {
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

    // Lưu lại ID mới nhất để so sánh
    lastEntryId = newestId;
}




// 💧 Giả lập mực nước (sau bạn có thể lấy từ cảm biến)
function updateWaterLevel(level) {
    document.getElementById('water').style.height = level + '%';
    document.getElementById('gauge-text').innerText = level + '%';
}


setInterval(fetchAndUpdate, 5000);