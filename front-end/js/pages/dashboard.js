console.log("✅ Dashboard loaded at " + new Date().toLocaleString());
//const apiUrl = 'https://iot-be-5421.onrender.com/api/in4-arduino/latest?limit=100000';
const token = localStorage.getItem('token');

document.getElementById("alarm-button").addEventListener("click", async () => {
    try {
        const payload = { alarm: "on" }; // payload gửi tới ESP32 qua server
        const res = await fetch("https://iot-be-5421.onrender.com/api/esp32/config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        console.log("✅ Đã gửi còi báo động:", data);
        alert("Đã kích hoạt còi báo động!");
    } catch (err) {
        console.error("❌ Lỗi gửi còi báo động:", err);
    }
});


let thresholds = {}

async function fetchThresholds() {
    try {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        const res = await fetch(`https://iot-be-5421.onrender.com/api/settings/${email}/get`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Không thể lấy dữ liệu ngưỡng");
        const data = await res.json();

        // Nếu API trả về mảng (ví dụ [{ MQ2: 500, ... }]) thì dùng data[0]
        thresholds = {
            MQ2: data[0]?.MQ2 || 700,
            MQ7: data[0]?.MQ7 || 1200,
            MQ135: data[0]?.MQ135 || 900,
            temp: data[0]?.temp || 60
        };

        console.log("📥 Ngưỡng lấy từ server:", thresholds);
    } catch (err) {
        console.error("❌ Lỗi khi lấy ngưỡng:", err.message);
    }
}

async function fetchAndUpdate() {
    await fetchThresholds(); // Đảm bảo ngưỡng được cập nhật trước
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const apiUrl = `https://iot-be-5421.onrender.com/api/in4-arduino/${email}/latest?limit=100`;

    try {
        const res = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        const data = await res.json();
        updateTable(data);  // Cập nhật mượt
        updateChart(data);  // Nếu cần vẽ lại biểu đồ
        if (!data || data.length === 0) return;
        const datareversed = data.reverse(); // Đảo ngược mảng để lấy bản ghi mới nhất
        const latest = data[data.length - 1];
        updateCards(latest);  // Cập nhật card

    } catch (e) {
        console.error("❌ Fetch error:", e);
    }
}

let lastFireAlertSentTime = 0;

function updateCards(latest) {
    if (!latest) return;
    console.log("🔄 Cập nhật card với:", latest);

    document.getElementById('value-mq2').innerText = latest.mq2 != null ? (latest.mq2 / 4095 * 100).toFixed(1) + '%' : "--";
    document.getElementById('value-mq7').innerText = latest.mq7 != null ? (latest.mq7 / 4095 * 100).toFixed(1) + '%' : "--";
    document.getElementById('value-mq135').innerText = latest.mq135 != null ? (latest.mq135 / 4095 * 100).toFixed(1) + '%' : "--";
    document.getElementById('value-temp').innerText = latest.temperature + '°C';

    const isNormal = latest.flame !== 0
        && latest.temperature < (thresholds.temp)
        && latest.mq2 < (thresholds.MQ2)
        && latest.mq7 < (thresholds.MQ7)
        && latest.mq135 < (thresholds.MQ135);
    document.getElementById('value-status').innerText = isNormal ? 'Ổn định' : 'Cảnh báo';
    if (!isNormal) {
        // Gửi email cảnh báo
        const now = Date.now();
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('token');
        if (email && token) { // 10 phút
            if (now - lastFireAlertSentTime > 10 * 60 * 1000) {
                alert("Bạn chưa nhận cảnh báo trong 10 phút qua. Gửi email mới...");
                lastFireAlertSentTime = now;
                fetch("https://iot-be-5421.onrender.com/api/users/fired", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        email: email,
                        name: localStorage.getItem('name') || 'User',
                        sensorData: {
                            mq2: latest.mq2,
                            mq7: latest.mq7,
                            mq135: latest.mq135,
                            temperature: latest.temperature,
                            flame: latest.flame,
                        },
                        thresholds: thresholds
                    })
                }).then(async res => {
                    const result = await res.json();
                    if (!res.ok) {
                        console.error("❌ API báo lỗi:", result);
                    } else {
                        console.log("📧 Email sent:", result);
                        lastFireAlertSentTime = now; // chỉ set khi gửi thành công
                    }
                })
                    .catch(err => {
                        console.error("❌ Lỗi khi gửi email:", err);
                    });
            }
        }

    }
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

function updateTable(data) {
    const table = document.querySelector('table');
    const latestRows = data.slice(-100); // lấy 100 dòng mới nhất (theo thời gian tăng dần)

    if (latestRows.length === 0) return;

    const latestEntry = latestRows[latestRows.length - 1]; // phần tử mới nhất
    const currentJSON = JSON.stringify(latestEntry);

    // Nếu giống hệt dữ liệu cũ → không cần cập nhật
    lastEntryJSON = currentJSON;

    // Xóa các dòng cũ (giữ dòng <th>)
    const oldRows = table.querySelectorAll("tr:not(:first-child)");
    oldRows.forEach(row => row.remove());

    // Cập nhật bảng theo thứ tự thời gian tăng dần
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
        const alerts = [];

        if (entry.flame === 0) alerts.push("Phát hiện có lửa 🔥");
        if (entry.temperature > thresholds.temp) alerts.push("Nhiệt độ cao");
        if (entry.mq2 > thresholds.MQ2) alerts.push("Rò rỉ khí gas");
        if (entry.mq7 > thresholds.MQ7) alerts.push("Nồng độ CO cao");
        if (entry.mq135 > thresholds.MQ135) alerts.push("Nồng độ khí gây cháy cao");

        message.textContent = alerts.length > 0 ? alerts.join(", ") : "Mọi thứ bình thường 😊";

        tr.append(no, id, date, message);
        table.appendChild(tr);
    });

    console.log("✅ Bảng đã cập nhật lúc", new Date().toLocaleTimeString());
}





// 💧 Giả lập mực nước (sau bạn có thể lấy từ cảm biến)
function updateWaterLevel(level) {
    document.getElementById('water').style.height = level + '%';
    document.getElementById('gauge-text').innerText = level + '%';
}


(async function init() {
    await fetchThresholds();
    fetchAndUpdate();
    setInterval(fetchAndUpdate, 5000);
})();