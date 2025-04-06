// src/promote.js

const promoteBtn = document.getElementById("superadmin-promote");
const result = document.getElementById("superadmin-result");
const userId = localStorage.getItem("userId");

if (!userId) {
  result.textContent = "You must be logged in to use this feature.";
  result.style.color = "red";
  promoteBtn.disabled = true;
}

promoteBtn.addEventListener("click", async () => {
  const secret_token = document.getElementById("superadmin-secret").value;
  if (!secret_token) {
    result.textContent = "Please enter a secret token.";
    result.style.color = "red";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/users/roles/super_admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, secret_token })
    });

    const data = await res.json();
    result.textContent = data.message;
    result.style.color = data.success ? "green" : "red";

    if (data.success) {
      localStorage.setItem("userRole", "super_admin");
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 1500);
    }
  } catch (err) {
    console.error("Promotion failed:", err);
    result.textContent = "Server error";
    result.style.color = "red";
  }
});
