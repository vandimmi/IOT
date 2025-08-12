const token = localStorage.getItem("token");
const email = localStorage.getItem("email");

document.addEventListener("DOMContentLoaded", () => {
    // GỌI LOAD DỮ LIỆU Ở ĐÂY
    loadThresholds();

    document.querySelector(".save-btn").addEventListener("click", async () => {
        const thresholds = {
            MQ2: parseInt(document.getElementById("MQ2").value),
            MQ7: parseInt(document.getElementById("MQ7").value),
            MQ135: parseInt(document.getElementById("MQ135").value),
            temp: parseInt(document.getElementById("temp").value),
            wifissid: '', // Thêm trường này nếu cần
            wifipass: '' // Thêm trường này nếu cần
        };


        try {
            // const res = await fetch("https://iot-be-5421.onrender.com/api/settings", {
            const res = await fetch(`https://iot-be-5421.onrender.com/api/settings/${email}/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(thresholds),
            });

            if (res.ok) {
                alert("Cài đặt đã lưu và gửi về thiết bị!");
            } else {
                alert("Lưu thất bại");
            }
            const payloadToEsp32 = {
                mq2: thresholds.MQ2 * 4095 / 100,
                mq7: thresholds.MQ7 * 4095 / 100,
                mq135: thresholds.MQ135 * 4095 / 100,
                temp: thresholds.temp,
                // chỉ gửi ssid/pass nếu có (tránh đổi Wi-Fi ngoài ý muốn)
                ...(thresholds.wifissid ? { ssid: thresholds.wifissid } : {}),
                ...(thresholds.wifipass ? { pass: thresholds.wifipass } : {}),
            };

            const mqttRes = await sendToEsp32(payloadToEsp32, token);
            if (mqttRes.ok) {
                console.log("✅ Đã gửi cấu hình đến ESP32:", mqttRes.data);
                alert("Cấu hình đã gửi thành công đến thiết bị!");
            } else {
                // Không fail toàn bộ nếu publish lỗi — thông báo để bạn biết
                alert("Đã lưu cài đặt, nhưng gửi về thiết bị không thành công.");
            }
        } catch (err) {
            alert("Có lỗi khi gửi dữ liệu: " + err.message);
        }
    });
});

async function sendToEsp32(payload, token) {
    try {
        const res = await fetch("https://iot-be-5421.onrender.com/api/esp32/config", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Thêm Bearer nếu backend của bạn yêu cầu auth;
                // nếu không cần, có thể bỏ dòng Authorization này.
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        console.log("📤 Gửi cấu hình đến ESP32:", data);
        return { ok: res.ok, data };
    } catch (e) {
        return { ok: false, error: e?.message || String(e) };
    }
}

async function loadThresholds() {
    const token = localStorage.getItem("token");

    try {
        // const res = await fetch("https://iot-be-5421.onrender.com/api/settings", {
        const res = await fetch(`https://iot-be-5421.onrender.com/api/settings/${email}/get?limit=1`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Không thể lấy dữ liệu setting");

        const data = await res.json();
        const settings = data[0];
        // GÁN DỮ LIỆU VÀO CÁC INPUT
        document.getElementById("MQ2").value = (typeof settings?.MQ2 === 'number' ? settings.MQ2.toFixed(1) : "70");
        document.getElementById("MQ7").value = (typeof settings?.MQ7 === 'number' ? settings.MQ7.toFixed(1) : "70");
        document.getElementById("MQ135").value = (typeof settings?.MQ135 === 'number' ? settings.MQ135.toFixed(1) : "70");
        document.getElementById("temp").value = (typeof settings?.temp === 'number' ? settings.temp.toFixed(1) : "50");
    } catch (err) {
        console.error("Lỗi khi tải setting:", err.message);
        alert("Không thể tải cài đặt hiện tại từ server.");
    }
}
