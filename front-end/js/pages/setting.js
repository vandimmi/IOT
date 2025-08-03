document.addEventListener("DOMContentLoaded", () => {
    // GỌI LOAD DỮ LIỆU Ở ĐÂY
    loadThresholds();

    document.querySelector(".save-btn").addEventListener("click", async () => {
        const thresholds = {
            MQ2: parseInt(document.getElementById("MQ2").value),
            MQ7: parseInt(document.getElementById("MQ7").value),
            MQ135: parseInt(document.getElementById("MQ135").value),
            temp: parseInt(document.getElementById("temp").value),
        };

        const token = localStorage.getItem("token");

        try {
            // const res = await fetch("http://localhost:8080/api/settings", {
            const res = await fetch("https://iot-be-5421.onrender.com/api/settings", {
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
        } catch (err) {
            alert("Có lỗi khi gửi dữ liệu: " + err.message);
        }
    });
});

async function loadThresholds() {
    const token = localStorage.getItem("token");

    try {
        // const res = await fetch("http://localhost:8080/api/settings", {
        const res = await fetch("https://iot-be-5421.onrender.com/api/settings", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Không thể lấy dữ liệu setting");

        const data = await res.json();
        const settings = data[0];
        // GÁN DỮ LIỆU VÀO CÁC INPUT
        document.getElementById("MQ2").value = settings.MQ2 || 1000;
        document.getElementById("MQ7").value = settings.MQ7 || 1000;
        document.getElementById("MQ135").value = settings.MQ135 || 300;
        document.getElementById("temp").value = settings.temp || 50;
    } catch (err) {
        console.error("Lỗi khi tải setting:", err.message);
        alert("Không thể tải cài đặt hiện tại từ server.");
    }
}
