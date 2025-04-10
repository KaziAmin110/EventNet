import api from "./api/axiosInstance.js";

const universityList = document.getElementById("publicEventsContainer");
const universityList2 = document.getElementById("privateEventsContainer");
const universityList3 = document.getElementById("rsoEventsContainer");

const publicEventsButton = document.getElementById("publicEventsButton");
const privateEventsButton = document.getElementById("privateEventsButton");
const rsoEventsButton = document.getElementById("rsoEventsButton");

const tempHeader = document.getElementById("tempHeader");
tempHeader.innerHTML = "Public Events";
let publicEventBool = true;
let privateEventBool = false;
let rsoEventsBool = false;

let userInfo = await getUserInfo();

localStorage.setItem("userId", userInfo.user_id); // ✅ just the number or string

function showOnlyEventForm(type) {
  const publicForm = document.getElementById("publicEventFormWrapper");
  const privateForm = document.getElementById("privateEventFormWrapper");
  const rsoForm = document.getElementById("rso-event-form-wrapper");

  publicForm.style.display = type === "public" ? "block" : "none";
  privateForm.style.display = type === "private" ? "block" : "none";

  // Only show RSO form if it already has options (user is an admin)
  const rsoHasOptions =
    document.getElementById("rso_select").options.length > 1;
  rsoForm.style.display = type === "rso" && rsoHasOptions ? "block" : "none";
}

async function fetchAllUserRSOEvents(
  publicEventBool,
  privateEventBool,
  rsoEventsBool
) {
  const token = localStorage.getItem("accessToken");
  console.log(token);
  if (!token) {
    alert("You must log in before selecting a university.");
    window.location.href = "index.html";
    return;
  }

  if (localStorage.getItem("universityId")) {
    window.location.href = "home.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/users/me/events", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();
    console.log("Universities API response:", result);

    const universities = result.data;

    let render = false;
    console.log(universities);
    universityList.innerHTML = "";
    universities.forEach((e) => {
      const li = document.createElement("li");
      const inviteButton = document.createElement("button");
      li.classList.add("university-item");
      if (publicEventBool && e.event_type === "public") {
        console.log(e.event_type);
        li.innerHTML = `${e.event_name}`;
        inviteButton.textContent = "Comment";
        inviteButton.classList.add("invite-button");

        li.appendChild(inviteButton);
        universityList.appendChild(li);

        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Enter comment";
        inputBox.style.display = "none";
        inputBox.classList.add("invite-input");
        const sendButton = document.createElement("button");
        sendButton.dataset.eventId = e.event_id;
        sendButton.textContent = "Send";
        sendButton.classList.add("send-button");
        sendButton.style.display = "none";
        const viewCommentsButton = document.createElement("button");
        viewCommentsButton.dataset.eventId = e.event_id;
        viewCommentsButton.textContent = "View Event Comments";
        viewCommentsButton.classList.add("send-button");
        viewCommentsButton.style.display = "block";
        getEventComments(viewCommentsButton, li);
        attachToggleInput(inviteButton, inputBox, sendButton);
        createEventComment(sendButton, viewCommentsButton, inputBox, li);
        li.appendChild(inputBox);
        li.appendChild(sendButton);
        li.appendChild(viewCommentsButton);
        e.event_rating = Math.round(e.event_rating * 10) / 10;
        createRatingBar(li, e.event_rating, e.event_id);
        render = true;
      } else if (privateEventBool && e.event_type === "university") {
        console.log(e.event_type);
        li.innerHTML = `${e.event_name}`;
        inviteButton.textContent = "Comment";
        inviteButton.classList.add("invite-button");

        li.appendChild(inviteButton);
        universityList.appendChild(li);

        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Enter comment";
        inputBox.style.display = "none"; // start hidden
        inputBox.classList.add("invite-input");
        const sendButton = document.createElement("button");
        sendButton.dataset.eventId = e.event_id;
        sendButton.textContent = "Send";
        sendButton.classList.add("send-button");
        sendButton.style.display = "none";
        const viewCommentsButton = document.createElement("button");
        viewCommentsButton.dataset.eventId = e.event_id;
        viewCommentsButton.textContent = "View Event Comments";
        viewCommentsButton.classList.add("send-button");
        viewCommentsButton.style.display = "block";
        getEventComments(viewCommentsButton, li);
        attachToggleInput(inviteButton, inputBox, sendButton);
        createEventComment(sendButton, viewCommentsButton, inputBox, li);
        li.appendChild(inputBox);
        li.appendChild(sendButton);
        li.appendChild(viewCommentsButton);
        e.event_rating = Math.round(e.event_rating * 10) / 10;
        createRatingBar(li, e.event_rating, e.event_id);
        render = true;
      } else if (rsoEventsBool && e.event_type === "rso") {
        console.log(e.event_type);
        li.innerHTML = `${e.event_name}`;
        inviteButton.textContent = "Comment";
        inviteButton.classList.add("invite-button");

        li.appendChild(inviteButton);
        universityList.appendChild(li);

        const inputBox = document.createElement("input");
        inputBox.type = "text";
        inputBox.placeholder = "Enter comment";
        inputBox.style.display = "none"; // start hidden
        inputBox.classList.add("invite-input");
        const sendButton = document.createElement("button");
        sendButton.dataset.eventId = e.event_id;
        sendButton.textContent = "Send";
        sendButton.classList.add("send-button");
        sendButton.style.display = "none";
        const viewCommentsButton = document.createElement("button");
        viewCommentsButton.dataset.eventId = e.event_id;
        viewCommentsButton.textContent = "View Event Comments";
        viewCommentsButton.classList.add("send-button");
        viewCommentsButton.style.display = "block";
        getEventComments(viewCommentsButton, li);
        attachToggleInput(inviteButton, inputBox, sendButton);
        createEventComment(sendButton, viewCommentsButton, inputBox, li);
        li.appendChild(inputBox);
        li.appendChild(sendButton);
        li.appendChild(viewCommentsButton);
        e.event_rating = Math.round(e.event_rating * 10) / 10;
        createRatingBar(li, e.event_rating, e.event_id);
        render = true;
      }
    });
    if (!render) {
      const nada = document.createElement("li");
      nada.innerHTML = "No events could be retrieved";
      universityList.appendChild(nada);
    }

    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const button = e.currentTarget;
        const uniId = button.dataset.id;

        console.log("Attempting to join university ID:", uniId);
        console.log("Using token:", token);

        try {
          const joinRes = await fetch(
            `http://localhost:5500/api/universities/rsos/me`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!joinRes.ok) {
            const errorText = await joinRes.text();
            throw new Error(
              `Join request failed with status ${joinRes.status}: ${errorText}`
            );
          }

          const joinData = await joinRes.json();

          if (joinData.success) {
            localStorage.setItem("universityId", uniId);
            localStorage.setItem(
              "universityName",
              button.previousElementSibling.textContent
            );
            alert("Joined university successfully. Proceeding to home...");
            window.location.href = "home.html";
          } else {
            alert(joinData.message || "Failed to join university.");
          }
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

function attachToggleInput(button, input, sendBtn) {
  button.addEventListener("click", () => {
    input.style.display = input.style.display === "none" ? "block" : "none";
    sendBtn.style.display = sendBtn.style.display === "none" ? "block" : "none";
  });
}

async function createEventComment(
  sendButton,
  viewCommentsButton,
  inputBox,
  li
) {
  sendButton.addEventListener("click", async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    const text = inputBox.value.trim();

    if (!text) {
      alert("Please enter a comment.");
      return;
    }
    let eventId = sendButton.dataset.eventId;

    try {
      const response = await fetch(
        `http://localhost:5500/api/events/${eventId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: text,
          }),
        }
      );

      const res = await response.json();
      console.log(res);
      if (res.status) {
        alert("Comment posted!");

        const currentComments = li.nextElementSibling;
        const commentsAreVisible =
          currentComments?.classList.contains("comments");

        if (commentsAreVisible) {
          await getEventCommentsRefresh(viewCommentsButton, li);
        }

        return res.data;
      } else {
        alert(res.message || "Failed to post comment.");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Something went wrong.");
    }
  });
}

async function getEventComments(button, li) {
  button.addEventListener("click", async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("You must be logged in to view comments.");
      return;
    }

    let eventId = button.dataset.eventId;

    try {
      const response = await fetch(
        `http://localhost:5500/api/events/${eventId}/comments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const fetchedComments = result.data;

        const prevComments = li.nextElementSibling;
        if (prevComments?.classList.contains("comments")) {
          prevComments.remove();
          button.innerHTML = "View Event Comments";
          return;
        }

        const comments = document.createElement("ul");
        comments.classList.add("comments");
        if (fetchedComments.length === 0) {
          const li = document.createElement("li");
          li.innerHTML = "No comments yet.";
          comments.appendChild(li);
        } else {
          fetchedComments.forEach(async (curComment) => {
            const liComment = document.createElement("li");
            const commentDiv = document.createElement("div");
            commentDiv.classList.add("comment-div");

            const text = document.createElement("span");
            text.innerHTML = curComment.text;
            text.classList.add("comment-text");
            commentDiv.appendChild(text);

            if (curComment.user_id === userInfo) {
              const deleteButton = document.createElement("button");
              deleteButton.textContent = "Delete";
              deleteButton.classList.add("comment-button-edit");
              deleteButton.style.display = "block";

              deleteButton.addEventListener("click", async () => {
                const confirmed = confirm(
                  "Are you sure you want to delete this comment?"
                );
                if (!confirmed) return;

                const token = localStorage.getItem("accessToken");
                if (!token) {
                  alert("You must be logged in to delete a comment.");
                  return;
                }

                try {
                  const response = await fetch(
                    `http://localhost:5500/api/events/${eventId}/comments/${curComment.comment_id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  const result = await response.json();
                  console.log(result);
                  if (result.status) {
                    alert("Comment deleted.");
                    button.click();
                    button.click();
                    commentDiv.parentElement.remove();
                  } else {
                    alert(result.message || "Failed to delete comment.");
                  }
                } catch (error) {
                  console.error("Error deleting comment:", error);
                  alert("Something went wrong.");
                }
              });

              const editButton = document.createElement("button");
              editButton.textContent = "Edit";
              editButton.classList.add("comment-button-edit");
              editButton.style.display = "block";
              let removed = false;
              let editInput = null;
              let saveButton = null;

              editButton.addEventListener("click", () => {
                if (commentDiv.querySelector(".comment-edit-input")) return;

                text.style.display = "none";
                editButton.style.display = "none";

                const editInput = document.createElement("input");
                editInput.type = "text";
                editInput.value = curComment.text;
                editInput.classList.add("comment-edit-input");

                const saveButton = document.createElement("button");
                saveButton.textContent = "Save";
                saveButton.classList.add("comment-button-edit");

                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.classList.add("comment-button-edit");

                saveButton.addEventListener("click", async () => {
                  const updatedText = editInput.value.trim();
                  if (!updatedText) {
                    alert("Comment can't be empty.");
                    return;
                  }

                  try {
                    const response = await fetch(
                      `http://localhost:5500/api/events/${eventId}/comments/${curComment.comment_id}`,
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ text: updatedText }),
                      }
                    );

                    const result = await response.json();

                    if (result.status) {
                      let tempData = await getEventCommentsByEventId(
                        button.dataset.eventId
                      );
                      console.log("hi");
                      console.log(tempData);
                      text.textContent = updatedText;
                      text.style.display = "inline";
                      editButton.style.display = "inline";
                    } else {
                      alert(result.message);
                    }
                  } catch (error) {
                    console.error("Error updating comment:", error);
                    alert("Something went wrong.");
                  }

                  editInput.remove();
                  saveButton.remove();
                  cancelButton.remove();
                });

                cancelButton.addEventListener("click", () => {
                  text.style.display = "inline";
                  editButton.style.display = "inline";
                  editInput.remove();
                  saveButton.remove();
                  cancelButton.remove();
                });

                commentDiv.appendChild(editInput);
                commentDiv.appendChild(saveButton);
                commentDiv.appendChild(cancelButton);
              });

              commentDiv.appendChild(deleteButton);
              commentDiv.appendChild(editButton);
            }
            liComment.appendChild(commentDiv);
            comments.appendChild(liComment);
          });
        }

        li.insertAdjacentElement("afterend", comments);
        button.textContent = "Hide Event Comments";
      }
    } catch (error) {
      console.error("Couldn't load the comments:", error);
      alert("Couldn't load the comments.");
    }
  });
}

async function getEventCommentsByEventId(eventId) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to view comments.");
    return [];
  }

  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}/comments`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return result.data;
    } else {
      alert(result.message || "Failed to fetch comments.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    alert("Something went wrong while retrieving comments.");
    return [];
  }
}

async function getEventCommentsRefresh(button, li) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Log in to view the comments.");
    return;
  }

  const eventId = button.dataset.eventId;

  const prevComments = li.nextElementSibling;
  if (prevComments?.classList.contains("comments")) {
    prevComments.remove();
  }

  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}/comments`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      const fetchedComments = result.data;

      const comments = document.createElement("ul");
      comments.classList.add("comments");

      if (fetchedComments.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No comments yet.";
        comments.appendChild(li);
      } else {
        fetchedComments.forEach((curComment) => {
          const li = document.createElement("li");
          li.textContent = curComment.text;
          comments.appendChild(li);
        });
      }

      li.insertAdjacentElement("afterend", comments);
      button.textContent = "Hide Event Comments";
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Error retreiving comments:", error);
    alert("Error retreiving comments.");
  }
}

async function getMyComments() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Log in to get comments.");
    return [];
  }

  try {
    const response = await fetch(
      "http://localhost:5500/api/users/me/comments",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return result.data;
    } else {
      alert(result.message);
      return [];
    }
  } catch (err) {
    console.error("Error retrieving the comments:", err);
    alert("Couldn't get the comments.");
    return [];
  }
}

function createRatingBar(container, event_rating, event_id) {
  const eventRatingText = document.createElement("span");
  eventRatingText.textContent = `Average Event Rating: ${event_rating}`;
  eventRatingText.style.fontSize = "14px";
  eventRatingText.style.fontWeight = "bold";
  eventRatingText.style.marginBottom = "4px";

  const ratingContainer = document.createElement("div");
  ratingContainer.style.display = "flex";
  ratingContainer.style.gap = "5px";
  ratingContainer.style.cursor = "pointer";

  let currentRating = 0;

  function updateStars() {
    const stars = ratingContainer.querySelectorAll("span");
    stars.forEach((star) => {
      const val = parseInt(star.dataset.value);
      star.innerHTML = val <= currentRating ? "★" : "☆";
    });
  }

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.innerHTML = "☆";
    star.dataset.value = i;
    star.style.fontSize = "20px";

    star.addEventListener("click", async () => {
      currentRating = i;
      updateStars();
      const token = localStorage.getItem("accessToken");

      try {
        const res = await fetch(
          `http://localhost:5500/api/events/${event_id}/ratings`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating: currentRating }),
          }
        );

        const data = await res.json();
        if (res.ok && data.success) {
          const updatedEvent = await getEventInfo(event_id);
          if (updatedEvent) {
            updatedEvent.event_rating =
              Math.round(updatedEvent.event_rating * 10) / 10;

            eventRatingText.textContent = `Average Event Rating: ${updatedEvent.event_rating}`;
          }
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Couldn't submit your rating.");
      }
    });

    ratingContainer.appendChild(star);
  }

  container.appendChild(eventRatingText);
  container.appendChild(ratingContainer);
}

async function getEventInfo(eventId) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("You must be logged in to get the event info.");
    return null;
  }

  try {
    const response = await fetch(
      `http://localhost:5500/api/events/${eventId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return result.data;
    } else {
      console.error("Error fetching event:", result.message);
      alert(result.message);
      return null;
    }
  } catch (err) {
    console.error(err);
    alert("Couldn't retrieve the info.");
    return null;
  }
}

async function getCommentInfo(eventId, commentId) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Log in to get the comment's info.");
    return null;
  }

  try {
    const res = await fetch(
      `http://localhost:5500/api/events/${eventId}/comments/${commentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await res.json();

    if (res.ok && result.success) {
      return result.data;
    } else {
      alert(result.message);
      return null;
    }
  } catch (error) {
    console.error(error);
    alert("Couldn't retrieve the comment info.");
    return null;
  }
}

async function getUserInfo() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    alert("Log in to get the user's info.");
    return null;
  }

  try {
    const response = await fetch("http://localhost:5500/api/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return result.data;
    } else {
      console.error(result.message);
      alert(result.message);
      return null;
    }
  } catch (err) {
    console.error(err);
    alert("Couldn't fetch the info");
    return null;
  }
}

publicEventsButton.addEventListener("click", () => {
  publicEventBool = true;
  privateEventBool = false;
  rsoEventsBool = false;
  tempHeader.innerHTML = "Public Events";
  fetchAllUserRSOEvents(publicEventBool, privateEventBool, rsoEventsBool);
  showOnlyEventForm("public");
});

privateEventsButton.addEventListener("click", () => {
  publicEventBool = false;
  privateEventBool = true;
  rsoEventsBool = false;
  tempHeader.innerHTML = "Private Events";
  fetchAllUserRSOEvents(publicEventBool, privateEventBool, rsoEventsBool);
  showOnlyEventForm("private");
});

rsoEventsButton.addEventListener("click", () => {
  publicEventBool = false;
  privateEventBool = false;
  rsoEventsBool = true;
  tempHeader.innerHTML = "RSO Events";
  fetchAllUserRSOEvents(publicEventBool, privateEventBool, rsoEventsBool);
  showOnlyEventForm("rso");
});

// Profile dropdown toggle
const profileButton = document.getElementById("profile-button");
const profileMenu = document.getElementById("profile-menu");

profileButton?.addEventListener("click", () => {
  profileMenu.classList.toggle("show-dropdown");
});

// Logout button logic
const logoutButton = document.querySelector(".sign_out_btn");

logoutButton?.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("universityIds");
  window.location.href = "index.html";
});

console.log("✅ JS loaded");

const form = document.getElementById("public-event-form");
if (!form) {
  console.warn("⚠️ public-event-form not found");
} else {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("📤 Form submitted");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("You must be logged in to create events.");
      return;
    }

    const data = {
      event_name: document.getElementById("event_name").value,
      description: document.getElementById("description").value,
      location: document.getElementById("location").value,
      latitude: parseFloat(document.getElementById("latitude").value),
      longitude: parseFloat(document.getElementById("longitude").value),
      start_date: new Date(
        document.getElementById("start_date").value
      ).toISOString(),
      end_date: new Date(
        document.getElementById("end_date").value
      ).toISOString(),
      contact_phone: document.getElementById("contact_phone").value,
      contact_email: document.getElementById("contact_email").value,
    };

    console.log("📦 Sending data:", data);
    console.log("Token:", token);
    alert("Public Event Request Sent. Pending Approval: ");

    try {
      const res = await fetch("http://localhost:5500/api/events/public", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "❌ Failed to create event.");
      }

      document.getElementById("result-msg").textContent =
        "✅ Event created successfully!";
      console.log("✅ Response:", resData);
      form.reset();
    } catch (err) {
      console.error("❌ Error creating event:", err.message);
      document.getElementById("result-msg").textContent =
        "❌ Failed to create event.";
    }
  });
}

//private event creation
const privateForm = document.getElementById("private-event-form");
if (privateForm) {
  privateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");

    //hardcoded for testing purposes
    const uniId = 19;

    console.log("Token is " + token);
    console.log("UNIID is " + uniId);

    if (!uniId) {
      alert("No university selected. Please choose one first.");
      return;
    }

    const data = {
      event_name: document.getElementById("private_event_name").value,
      description: document.getElementById("private_description").value,
      location: document.getElementById("private_location").value,
      latitude: parseFloat(document.getElementById("private_latitude").value),
      longitude: parseFloat(document.getElementById("private_longitude").value),
      start_date: new Date(
        document.getElementById("private_start_date").value
      ).toISOString(),
      end_date: new Date(
        document.getElementById("private_end_date").value
      ).toISOString(),
      contact_phone: document.getElementById("private_contact_phone").value,
      contact_email: document.getElementById("private_contact_email").value,
    };

    try {
      const res = await fetch(
        `http://localhost:5500/api/universities/${uniId}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      document.getElementById("private-result-msg").textContent =
        "✅ Private event created!";
      privateForm.reset();
    } catch (err) {
      console.error("Error creating private event:", err);
      document.getElementById("private-result-msg").textContent =
        "❌ Failed to create private event.";
    }
  });
}

//RSO event creation
async function loadUserRSOsForAdmin() {
  const token = localStorage.getItem("accessToken");
  const currentUserId = localStorage.getItem("userId");

  if (!token || !currentUserId) {
    console.warn("No access token or user ID found.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5500/api/universities/rsos/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    console.log("RSOs fetched:", result);

    if (!res.ok || !result.success) throw new Error(result.message);

    const rsoList = result.data;
    const rsoSelect = document.getElementById("rso_select");

    let isAdmin = false;

    rsoList.forEach((rso) => {
      if (rso.admin_user_id == currentUserId) {
        const option = document.createElement("option");
        option.value = JSON.stringify({
          uni_id: rso.uni_id,
          rso_id: rso.rso_id,
        });
        option.textContent = rso.rso_name;
        rsoSelect.appendChild(option);
        isAdmin = true;
      }
    });

    if (isAdmin) {
      console.log("✅ User is an RSO admin.");
      document.getElementById("rso-event-form-wrapper").dataset.visible =
        "block";
    } else {
      console.log("ℹ️ User is not an RSO admin.");
    }
  } catch (err) {
    console.error("❌ Error fetching RSOs:", err);
  }
}

const rsoForm = document.getElementById("rso-event-form");

if (rsoForm) {
  rsoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("accessToken");
    const selected = JSON.parse(document.getElementById("rso_select").value);

    const data = {
      event_name: document.getElementById("rso_event_name").value,
      description: document.getElementById("rso_description").value,
      location: document.getElementById("rso_location").value,
      latitude: parseFloat(document.getElementById("rso_latitude").value),
      longitude: parseFloat(document.getElementById("rso_longitude").value),
      start_date: new Date(
        document.getElementById("rso_start_date").value
      ).toISOString(),
      end_date: new Date(
        document.getElementById("rso_end_date").value
      ).toISOString(),
      contact_phone: document.getElementById("rso_contact_phone").value,
      contact_email: document.getElementById("rso_contact_email").value,
    };

    try {
      const res = await fetch(
        `http://localhost:5500/api/universities/${selected.uni_id}/rsos/${selected.rso_id}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      document.getElementById("rso-result-msg").textContent =
        "✅ RSO Event created!";
      rsoForm.reset();
    } catch (err) {
      console.error("Error creating RSO event:", err.message);
      document.getElementById("rso-result-msg").textContent =
        "❌ Failed to create RSO event.";
    }
  });
}

showOnlyEventForm(""); // hides all on initial load

fetchAllUserRSOEvents(publicEventBool, privateEventBool, rsoEventsBool);
loadUserRSOsForAdmin();
