const token = localStorage.getItem("accessToken");
const joinedList = document.getElementById("your-rsos");
const availableList = document.getElementById("available-rsos");

if (!token) {
  alert("Please log in.");
  window.location.href = "index.html";
}

async function getUserUniversities() {
  const res = await fetch("http://localhost:5500/api/universities/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data.map(u => u.uni_id); // return array of uni_ids
}

async function getJoinedRSOs() {
  const res = await fetch("http://localhost:5500/api/universities/rsos/me", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data || [];
}

async function getRSOsAtUniversity(uniId) {
  const res = await fetch(`http://localhost:5500/api/universities/${uniId}/rsos`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const result = await res.json();
  return result.data || [];
}

function renderRSOList(container, rsos, buttonLabel = null, clickHandler = null, showLeave = false) {
  container.innerHTML = "";

  if (!rsos.length) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "No RSOs to show.";
    container.appendChild(emptyMsg);
    return;
  }

  rsos.forEach(rso => {
    const li = document.createElement("li");
    li.className = "rso-card";

    li.innerHTML = `
      <h3>${rso.rso_name}</h3>
      <p>Members: ${rso.num_members ?? 0}</p>
      <p>Status: ${rso.rso_status ?? "unknown"}</p>
    `;

    if (buttonLabel && clickHandler) {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = buttonLabel;
      btn.addEventListener("click", () => clickHandler(rso));
      li.appendChild(btn);
    }

    if (showLeave) {
      const leaveBtn = document.createElement("button");
      leaveBtn.className = "btn";
      leaveBtn.textContent = "Leave";
      leaveBtn.addEventListener("click", () => handleLeaveRSO(rso));
      li.appendChild(leaveBtn);
    }

    container.appendChild(li);
  });
}

async function handleLeaveRSO(rso) {
  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`http://localhost:5500/api/universities/${rso.uni_id}/rsos/${rso.rso_id}/leave`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const result = await res.json();

    if (res.ok && result.success) {
      alert(`You have left ${rso.rso_name}.`);
      initRSOPage(); // Refresh lists
    } else {
      alert(result.message || "Failed to leave RSO.");
    }

  } catch (err) {
    console.error("Leave RSO failed:", err);
    alert("Error leaving RSO.");
  }
}



async function initRSOPage() {
  const token = localStorage.getItem("accessToken");

  // Step 1: Get all universities the user is part of
  const universityRes = await fetch("http://localhost:5500/api/universities/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const universityData = await universityRes.json();
  const universityIds = universityData.data.map(u => u.uni_id);

  // Step 2: Get RSOs the user has joined
  const joinedRSOs = await getJoinedRSOs();
  const joinedRSOIds = new Set(joinedRSOs.map(rso => rso.rso_id));

  // Step 3: Render RSOs the user is already in
  renderRSOList(joinedList, joinedRSOs, null, null, true);

  // Step 4: Loop through user's universities and fetch available RSOs
  const allAvailable = [];

  for (const uniId of universityIds) {
    const rsos = await getRSOsAtUniversity(uniId);
    const unjoined = rsos.filter(rso => !joinedRSOIds.has(rso.rso_id));
    unjoined.forEach(rso => {
      rso.uni_id = uniId; // needed for the join call later
    });
    allAvailable.push(...unjoined);
  }

  // Step 5: Render available RSOs with Join button
  renderRSOList(availableList, allAvailable, "JOIN", async (rso) => {
    try {
      const res = await fetch(`http://localhost:5500/api/universities/${rso.uni_id}/rsos/${rso.rso_id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert(`Joined ${rso.rso_name}`);
        initRSOPage(); // Refresh list
      } else {
        alert(result.message || "Failed to join.");
      }
    } catch (err) {
      console.error("Join failed:", err);
      alert("Join request failed.");
    }
  });
}

const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");

profileButton?.addEventListener("click", () => {
  profileMenu.classList.toggle("show-dropdown");
});

initRSOPage();


document.getElementById("create-rso-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("accessToken");
  const rsoName = document.getElementById("rso-name").value.trim();

  if (!rsoName) {
    alert("Please enter an RSO name.");
    return;
  }

  try {
    // Get the user's first university
    const uniRes = await fetch("http://localhost:5500/api/universities/me", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const uniData = await uniRes.json();
    const uniId = uniData.data?.[0]?.uni_id;

    if (!uniId) {
      alert("Could not determine your university.");
      return;
    }

    const createRes = await fetch(`http://localhost:5500/api/universities/${uniId}/rsos/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ rso_name: rsoName })
    });

    const createResult = await createRes.json();

    if (createRes.ok && createResult.success) {
      alert("RSO creation submitted. Approval pending until there are 5 total members.");
      document.getElementById("rso-name").value = "";
      initRSOPage(); // Refresh lists
    } else {
      alert(createResult.message || "Failed to create RSO.");
    }

  } catch (err) {
    console.error("Create RSO error:", err);
    alert("An error occurred while creating the RSO.");
  }
});

// Logout button logic
const logoutButton = document.querySelector(".sign_out_btn");

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("universityIds");
  window.location.href = "index.html";
});
