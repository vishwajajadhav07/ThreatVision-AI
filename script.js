/* =====================================================
   ThreatVision AI
   Landing Page Script
===================================================== */

/* ===============================
   Animated Threat Counter
================================ */

const counter = document.getElementById("threatCounter");

if (counter) {

    let count = 0;
    const target = 12845;

    const speed = 30;

    const updateCounter = () => {

        count += Math.ceil((target - count) / 25);

        if (count >= target) {

            counter.innerHTML = target.toLocaleString();

        } else {

            counter.innerHTML = count.toLocaleString();

            setTimeout(updateCounter, speed);

        }

    };

    updateCounter();

}

/* ===============================
   Navbar Scroll Effect
================================ */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.background = "#08111F";

        navbar.style.boxShadow = "0 10px 30px rgba(0,212,255,.15)";

    }

    else {

        navbar.style.background = "rgba(8,17,31,.90)";

        navbar.style.boxShadow = "none";

    }

});

/* ===============================
   Smooth Scroll
================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

/* ===============================
   Reveal Animation
================================ */

const revealElements = document.querySelectorAll(

    ".stat-box, .feature-card, .step, .tech-grid div"

);

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.style.opacity = "1";

            entry.target.style.transform = "translateY(0)";

        }

    });

}, {

    threshold: 0.2

});

revealElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform = "translateY(40px)";

    element.style.transition = ".8s ease";

    observer.observe(element);

});

/* ===============================
   Button Hover Effect
================================ */

const buttons = document.querySelectorAll(

    ".primary-btn, .secondary-btn, .login-btn"

);

buttons.forEach(button => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "scale(1.05)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "scale(1)";

    });

});

/* ===============================
   Current Year (Future Use)
================================ */

const year = new Date().getFullYear();

console.log("ThreatVision AI © " + year);

/* ===============================
   Console Welcome
================================ */

console.log("%cThreatVision AI",

"color:#00D4FF;font-size:28px;font-weight:bold;");

console.log(

"%cAI Powered Cybersecurity Threat Detection Platform",

"color:white;font-size:14px;"

);