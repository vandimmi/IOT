const token = localStorage.getItem("token");
const email = localStorage.getItem("email");
if (!token) {
    alert("Unauthorized. Please login.");
    window.location.href = "login.html";
}

async function loadUserInfo() {
    try {
        const res = await fetch(`https://iot-be-5421.onrender.com/api/users/${email}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const resSettings = await fetch("https://iot-be-5421.onrender.com/api/settings/get?limit=1", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();
        const settings = await resSettings.json();

        // 🟢 Gán dữ liệu vào UI
        document.getElementById("displayName").innerText = data.name || "No name";
        document.getElementById("displayEmail").innerText = data.email;
        document.getElementById("readonly-email").innerText = data.email;

        document.getElementById("name").value = data.name || "";
        // WiFi/Telegram: nếu có
        document.getElementById("wifiName").value = settings.wifiName || "";
        document.getElementById("wifiPassword").value = settings.wifiPassword || "";

    } catch (err) {
        console.error(err);
        alert("❌ Failed to load user data.");
    }
}

loadUserInfo();

document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("name").value,
        password: document.getElementById("password").value,
    };

    const settings = {
        wifiName: document.getElementById("wifiName").value,
        wifiPassword: document.getElementById("wifiPassword").value
    };

    try {
        const res = await fetch("https://iot-be-5421.onrender.com/api/users/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        if (res.ok) {
            alert("✅ Profile updated successfully!");
        } else {
            alert("❌ Update failed: " + (result.message || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Error connecting to server.");
    }

    try {
        const resSettings = await fetch("https://iot-be-5421.onrender.com/api/settings/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(settings)
        });

        const resultSettings = await resSettings.json();
        if (resSettings.ok) {
            alert("✅ Settings updated successfully!");
        } else {
            alert("❌ Settings update failed: " + (resultSettings.message || "Unknown error"));
        }
    } catch (err) {
        console.error(err);
        alert("❌ Error connecting to server for settings.");
    }
});