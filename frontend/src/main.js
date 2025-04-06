console.log("main.js loaded");

import { signUp, signIn } from "./auth.js";

// Find the forms on the page
const signInForm = document.querySelector(".sign-in form");
const signUpForm = document.querySelector(".register form");

if (signInForm) {
  console.log("Sign-in form found");
  signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Sign in form submitted");

    const email = signInForm.querySelector('input[type="email"]').value;
    const password = signInForm.querySelector('input[type="password"]').value;
    console.log("Sign in credentials:", email, password);

    try {
      const result = await signIn(email, password);
      console.log("Sign in response:", result);
      if (result.error) {
        alert("Sign in error: " + result.error.message);
      } else {
        window.location.href = "home.html";
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      const message = error.response?.data?.error || "An unknown error occurred.";
      alert("Sign in failed: " + message);
    }
  });
} else {
  console.warn("Sign in form not found");
}

if (signUpForm) {
  console.log("Sign-up form found");
  signUpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Sign up form submitted");

    const email = signUpForm.querySelector('input[type="email"]').value;
    const password = signUpForm.querySelector('input[type="password"]').value;
    const name = signUpForm.querySelector('input[name="name"]').value;
    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    console.log("Sign up credentials:", name, email, password);

    if (!name || name.trim().split(/\s+/).length < 2) {
      nameError.textContent = "Please enter both your first and last name.";
      nameError.style.display = "block";
      return;
    } else {
      nameError.style.display = "none";
    }
    

    const isValidEmail = /^[^@\s]+@[^@\s]+\.edu$/.test(email);
    if (!isValidEmail) {
      emailError.textContent = "Please use a valid .edu email address (e.g., name@university.edu).";
      emailError.style.display = "block";
      return;
    } else {
      emailError.style.display = "none";
    }

    const isValidPassword = /^(?=.*[A-Za-z])(?=.*\W).{8,}$/.test(password);
    if (!isValidPassword) {
      passwordError.textContent = "Password must be at least 8 characters, include one special character and one letter.";
      passwordError.style.display = "block";
      return;
    } else {
      passwordError.style.display = "none";
    }

    try {
      const result = await signUp(name, email, password);
      console.log("Sign up result:", result);
      window.location.href = "index.html";
    } catch (error) {
      console.error("Sign up failed:", error);
      const message = error.response?.data?.error || "An unknown error occurred.";
      passwordError.textContent = message;
      passwordError.style.display = "block";
    }
  });
} else {
  console.warn("Sign up form not found");
}
