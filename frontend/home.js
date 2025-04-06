// home.js

// Show/hide profile dropdown menu
const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");

profileButton?.addEventListener("click", () => {
  profileMenu.classList.toggle("show-dropdown");
});

// Super admin panel logic
const userRole = localStorage.getItem("userRole");
const superAdminPanel = document.getElementById("super-admin-panel");

if (userRole === "super_admin") {
  superAdminPanel.style.display = "block";
}

const superForm = document.getElementById("create-superadmin-form");
superForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user_id = document.getElementById("superadmin-user-id").value;
  const secret_token = document.getElementById("superadmin-secret").value;
  const result = document.getElementById("superadmin-result");

  try {
    const response = await fetch("http://localhost:5500/api/users/roles/super_admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, secret_token })
    });

    const data = await response.json();
    result.textContent = data.message;
    result.style.color = data.success ? "green" : "red";
  } catch (error) {
    console.error("Error promoting super admin:", error);
    result.textContent = "Server error";
    result.style.color = "red";
  }
});

// Logout button
const logoutButton = document.querySelector(".sign_out_btn");
logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  window.location.href = "index.html";
});
