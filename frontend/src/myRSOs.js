import api from "./api/axiosInstance.js";
import { getUserInfo } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  let uniId; // 👈 Define this at top so it's accessible everywhere

  try {
    // Step 1: Get user info and university ID
    const userResponse = await getUserInfo();
    const currentUser = userResponse.data;
    console.log("Current user:", currentUser);

    // TEMP: Prompt for university ID (until backend returns it)
    uniId = prompt("Enter your university ID:");
    if (!uniId) {
      alert("University ID is required to fetch RSOs.");
      return;
    }

    // Step 2: Get RSOs at this university
    const allRSOs = await getUniversityRSOs(uniId);
    console.log("All RSOs at university:", allRSOs);

    // Step 3: Divide RSOs into ones the user is an admin of, and available ones
    const yourRSOs = [];
    const availableRSOs = [];

    for (const rso of allRSOs) {
      if (rso.admin_user_id === currentUser.user_id) {
        yourRSOs.push({ ...rso, role: "admin" });
      } else {
        availableRSOs.push(rso);
      }
    }

    // Step 4: Render to the page
    renderYourRSOs(yourRSOs);
    renderAvailableRSOs(availableRSOs);

  } catch (err) {
    console.error("Error loading RSOs:", err);
  }

  // Home nav fix
  const homeNavLink = document.querySelector('nav.taskbar a[href="#"]');
  if (homeNavLink) {
    homeNavLink.href = "home.html";
  }

  // 🔄 Toggle create RSO form
  const toggleBtn = document.getElementById("toggle-create-rso");
  const formCard = document.getElementById("create-rso-container");

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent close when clicking button
    formCard.classList.toggle("hidden");
  });

  // 🧼 Hide form when clicking outside
  document.addEventListener("click", (e) => {
    if (!formCard.contains(e.target) && !toggleBtn.contains(e.target)) {
      formCard.classList.add("hidden");
    }
  });

  // Create RSO Form Submission
  const createForm = document.getElementById("create-rso-form");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const rsoName = document.getElementById("new-rso-name").value.trim();
      if (!rsoName) {
        alert("Please enter an RSO name.");
        return;
      }

      try {
        await api.post(`/universities/${uniId}/rsos/`, {
          rso_name: rsoName,
        });

        alert(`RSO "${rsoName}" created successfully!`);
        location.reload(); // or call render functions if smoother UX needed
      } catch (err) {
        console.error("Create RSO error:", err);
        alert("Failed to create RSO.");
      }
      console.log("Posting RSO to:", `/universities/${uniId}/rsos/`);
      console.log("Request body:", { rso_name: rsoName });

    });
  }
});

// ===============================
// UTILITY + ACTION FUNCTIONS
// ===============================

async function getUniversityRSOs(uniId) {
  const response = await api.get(`/universities/${uniId}/rsos`);
  return response.data.data;
}

function renderYourRSOs(rsos) {
  const container = document.getElementById("your-rsos");
  if (!rsos.length) {
    container.innerHTML = "<p>You are not part of any RSOs yet.</p>";
    return;
  }

  container.innerHTML = rsos.map(rso => `
    <div class="rso-card">
      <h3>${rso.rso_name}</h3>
      <button class="btn" onclick="inviteMember(${rso.rso_id})">Invite by Email</button>
      <button class="btn" onclick="leaveRSO(${rso.rso_id})">Leave RSO</button>
    </div>
  `).join("");
}

function renderAvailableRSOs(rsos) {
  const container = document.getElementById("available-rsos");
  if (!rsos.length) {
    container.innerHTML = "<p>No RSOs available to join.</p>";
    return;
  }

  container.innerHTML = rsos.map(rso => `
    <div class="rso-card">
      <h3>${rso.rso_name}</h3>
      <button class="btn" onclick="joinRSO(${rso.rso_id})">Join</button>
    </div>
  `).join("");
}

window.inviteMember = async function (rsoId) {
  const email = prompt("Enter email to invite:");
  if (!email) return;

  try {
    await api.post(`/rsos/${rsoId}/invite`, { email });
    alert("Invitation sent!");
  } catch (err) {
    alert("Failed to send invite.");
  }
};

window.leaveRSO = async function (rsoId) {
  if (!confirm("Are you sure you want to leave this RSO?")) return;

  try {
    await api.post(`/rsos/${rsoId}/leave`);
    window.location.reload();
  } catch (err) {
    alert("Could not leave RSO.");
  }
};

window.joinRSO = async function (rsoId) {
  try {
    await api.post(`/rsos/${rsoId}/join`);
    window.location.reload();
  } catch (err) {
    alert("Could not join RSO.");
  }
};
