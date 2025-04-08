const universityList = document.getElementById("joinable-university-list");
const joinedList = document.getElementById("joined-university-list");

// Store multiple university IDs
function storeUniversityId(uniId) {
  const ids = JSON.parse(localStorage.getItem("universityIds")) || [];
  if (!ids.includes(parseInt(uniId))) {
    ids.push(parseInt(uniId));
    localStorage.setItem("universityIds", JSON.stringify(ids));
  }
}

// Display joined universities list
async function displayJoinedUniversities() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    joinedList.innerHTML = "<li>Please log in to see joined universities.</li>";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/universities/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || "Failed to load joined universities");
    }

    const universities = result.data;
    joinedList.innerHTML = "";

    if (!universities.length) {
      joinedList.innerHTML = "<li>No universities joined yet.</li>";
      return;
    }

    universities.forEach((uni) => {
      const li = document.createElement("li");
      li.textContent = uni.uni_name;
      joinedList.appendChild(li);
    });
  } catch (err) {
    console.error("Error fetching joined universities:", err);
    joinedList.innerHTML = "<li>Failed to load universities.</li>";
  }
}


// Display joinable universities
async function fetchUniversities() {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    alert("You must log in before selecting a university.");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/universities", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    const result = await res.json();
    console.log("Universities API response:", result);

    const universities = result.data;

    if (!Array.isArray(universities)) {
      throw new Error("Expected an array of universities, got: " + JSON.stringify(universities));
    }

    universityList.innerHTML = ""; // Clear previous list

    universities.forEach((uni) => {
      const li = document.createElement("li");
      li.classList.add("university-item");
      li.innerHTML = `
        <span>${uni.uni_name}</span>
        <button class="join-btn" data-id="${uni.uni_id}">Join</button>
      `;
      universityList.appendChild(li);
    });

    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget;
        const uniId = button.dataset.id;

        try {
          const joinRes = await fetch(`http://localhost:5500/api/universities/${uniId}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });

          const joinData = await joinRes.json();

          if (!joinRes.ok || !joinData.success) {
            throw new Error(joinData.message || "Failed to join university.");
          }

          storeUniversityId(uniId);
          alert(`Joined "${button.previousElementSibling.textContent}" successfully!`);
          displayJoinedUniversities(); // update the list
        } catch (err) {
          console.error("Join failed:", err);
          alert("Error joining university: " + err.message);
        }
      });
    });
  } catch (err) {
    console.error("Error loading universities:", err);
    universityList.innerHTML = "<li>Failed to load universities.</li>";
  }
}

// Profile dropdown toggle
const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");

profileButton?.addEventListener("click", () => {
  profileMenu.classList.toggle("show-dropdown");
});

fetchUniversities();
displayJoinedUniversities();
