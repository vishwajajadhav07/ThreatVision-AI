document.addEventListener("DOMContentLoaded", () => {


    const totalScans = document.getElementById("totalScans");
    const threatsDetected = document.getElementById("threatsDetected");
    const riskScore = document.getElementById("riskScore");
    const alerts = document.getElementById("alerts");



    let scans = Number(localStorage.getItem("scans") || 0);

    let threats = Number(localStorage.getItem("threats") || 0);



    totalScans.innerText = scans;

    threatsDetected.innerText = threats;



    if(threats > 0){

        riskScore.innerText = "HIGH";

        riskScore.style.color = "#ff1744";


        alerts.innerHTML = `

        <li>
        🚨 ${threats} threat(s) detected during security scans
        </li>

        <li>
        ⚠ Review suspicious files immediately
        </li>

        `;


    }
    else{


        riskScore.innerText = "LOW";

        riskScore.style.color="#00ff9d";


        alerts.innerHTML = `

        <li>
        ✅ No security threats detected
        </li>

        <li>
        🔒 System is operating normally
        </li>

        `;


    }




});