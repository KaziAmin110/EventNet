// main.js
console.log("main.js loaded");

import { signUp, signIn } from './auth.js';

// Find the forms on the page
const signInForm = document.querySelector('.sign-in form');
const signUpForm = document.querySelector('.register form');

if (signInForm) {
  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log("Sign in form submitted");

    const email = signInForm.querySelector('input[type="email"]').value;
    const password = signInForm.querySelector('input[type="password"]').value;
    console.log("Sign in credentials:", email, password);

    const result = await signIn(email, password);
    console.log("Sign in result:", result);

    if (result.error) {
      alert("Sign in error: " + result.error.message);
    } else {
      const user = result.data.user;
      // Check if the email is verified
      if (!user.email_confirmed_at) {
        alert("Please verify your email address before signing in.");
        return;
      }
      // Redirect or update the UI for a verified user
      window.location.href = "home.html";
    }
  });
} else {
  console.warn("Sign in form not found");
}

if (signUpForm) {
  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    console.log("Sign up form submitted");

    const email = signUpForm.querySelector('input[type="email"]').value;
    const password = signUpForm.querySelector('input[type="password"]').value;
    console.log("Sign up credentials:", email, password);

    const result = await signUp(email, password);
    console.log("Sign up result:", result);

    if (result.error) {
      alert("Sign up error: " + result.error.message);
    } else {
      // Instead of redirecting, inform the user to verify their email.
      alert("A verification email has been sent. Please check your inbox before signing in.");
      //the form fields here.
      signUpForm.reset();
    }
  });
} else {
  console.warn("Sign up form not found");
}
