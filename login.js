/* ==========================================
   ThreatVision AI - Login Page
========================================== */

const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

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
   Login Validation
========================= */

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const emailValue = email.value.trim();

    const passwordValue = password.value.trim();

    if (emailValue === "" || passwordValue === "") {

        alert("Please fill in all fields.");

        return;

    }

    if (!isValidEmail(emailValue)) {

        alert("Please enter a valid email address.");

        email.focus();

        return;

    }

    if (passwordValue.length < 6) {

        alert("Password must be at least 6 characters.");

        password.focus();

        return;

    }

    alert("Login Successful!");

    window.location.href = "dashboard.html";

});

/* =========================
   Social Login Buttons
========================= */

const googleBtn = document.querySelector(".google");

const githubBtn = document.querySelector(".github");

googleBtn.addEventListener("click", () => {

    alert("Google Login will be integrated in the backend.");

});

githubBtn.addEventListener("click", () => {

    alert("GitHub Login will be integrated in the backend.");

});

/* =========================
   Console Message
========================= */

console.log("ThreatVision AI Login Page Loaded Successfully");