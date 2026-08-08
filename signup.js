/* ==========================================
   ThreatVision AI - Signup Page
========================================== */

const signupForm = document.getElementById("signupForm");

const fullName = document.getElementById("fullname");

const email = document.getElementById("email");

const password = document.getElementById("password");

const confirmPassword = document.getElementById("confirmPassword");

const terms = document.getElementById("terms");

const togglePassword = document.getElementById("togglePassword");

/* =========================
   Show / Hide Password
========================= */

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {

        password.type = "text";

        togglePassword.classList.remove("fa-eye");

        togglePassword.classList.add("fa-eye-slash");

    } else {

        password.type = "password";

        togglePassword.classList.remove("fa-eye-slash");

        togglePassword.classList.add("fa-eye");

    }

});

/* =========================
   Email Validation
========================= */

function isValidEmail(emailAddress) {

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(emailAddress);

}

/* =========================
   Signup Validation
========================= */

signupForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const name = fullName.value.trim();

    const emailValue = email.value.trim();

    const passwordValue = password.value.trim();

    const confirmValue = confirmPassword.value.trim();

    if (name === "") {

        alert("Please enter your full name.");

        fullName.focus();

        return;

    }

    if (!isValidEmail(emailValue)) {

        alert("Please enter a valid email address.");

        email.focus();

        return;

    }

    if (passwordValue.length < 6) {

        alert("Password must be at least 6 characters long.");

        password.focus();

        return;

    }

    if (passwordValue !== confirmValue) {

        alert("Passwords do not match.");

        confirmPassword.focus();

        return;

    }

    if (!terms.checked) {

        alert("Please accept the Terms & Conditions.");

        return;

    }

    alert("Account Created Successfully!");

    window.location.href = "login.html";

});

/* =========================
   Console Message
========================= */

console.log("ThreatVision AI Signup Page Loaded Successfully");