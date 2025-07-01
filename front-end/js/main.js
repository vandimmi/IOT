// header
fetch('../components/header.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('header-placeholder').innerHTML = data;
    });

// dropdown
function toggleDropdown() {
    const dropdown = document.getElementById("dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    var container = document.querySelector(".profile-container");
    dropdown.classList.toggle("show");
    container.classList.toggle("open");
}
document.addEventListener("click", function (event) {
    const dropdown = document.getElementById("dropdown");
    if (!event.target.closest(".profile-container")) {
        dropdown.style.display = "none";
    }
});
