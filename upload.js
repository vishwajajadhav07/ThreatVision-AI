// ======================================================
// THREATVISION AI
// FILE + IP / URL SECURITY SCANNER
// ======================================================


// ======================================================
// FILE ELEMENTS
// ======================================================

const fileInput =
    document.getElementById("fileInput");

const selectedFile =
    document.getElementById("selectedFile");

const scanBtn =
    document.getElementById("scanBtn");

const resultBox =
    document.getElementById("resultBox");


// ======================================================
// SHOW SELECTED FILE
// ======================================================

fileInput.addEventListener(
    "change",
    () => {

        const file =
            fileInput.files[0];

        if (!file) {

            selectedFile.textContent =
                "No file selected";

            return;
        }

        selectedFile.textContent =
            file.name;

    }
);


// ======================================================
// FILE SCAN
// ======================================================

scanBtn.addEventListener(
    "click",
    async () => {

        const file =
            fileInput.files[0];


        if (!file) {

            alert(
                "Please select a file first."
            );

            return;
        }


        scanBtn.disabled = true;

        scanBtn.textContent =
            "🔍 Scanning...";


        resultBox.style.display =
            "block";


        resultBox.innerHTML = `

            <div class="loading">

                🔍 Analyzing file...

                <br><br>

                <small>
                    ThreatVision AI is scanning
                    the uploaded file.
                </small>

            </div>

        `;


        try {

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            const response =
                await fetch(
                    "/scan",
                    {

                        method: "POST",

                        body:
                            formData

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "File scan failed."
                );

            }


            renderFileResult(
                data
            );


        } catch (error) {

            resultBox.innerHTML = `

                <div class="danger-message">

                    ❌
                    <strong>
                        Scan Failed
                    </strong>

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                </div>

            `;

        } finally {

            scanBtn.disabled =
                false;

            scanBtn.textContent =
                "🔍 Scan File";

        }

    }
);


// ======================================================
// FILE RESULT
// ======================================================

function renderFileResult(
    data
) {

    const detected =
        Boolean(
            data.threatDetected
        );


    resultBox.style.borderLeftColor =
        detected
            ? "#ff3155"
            : "#00e59b";


    resultBox.innerHTML = `

        <div class="${
            detected
                ? "danger-message"
                : "success-message"
        }">

            ${
                detected
                    ? "🚨"
                    : "✅"
            }

            <strong>

                ${
                    detected
                        ? "Threat Detected"
                        : "File Safe"
                }

            </strong>

        </div>


        <br>


        <div>

            <strong>
                File:
            </strong>

            ${escapeHTML(
                data.file ||
                "Unknown"
            )}

        </div>


        <div>

            <strong>
                Risk Level:
            </strong>

            ${escapeHTML(
                data.riskLevel ||
                "Unknown"
            )}

        </div>


        <br>


        <div>

            ${escapeHTML(
                data.message ||
                "Analysis completed."
            )}

        </div>

    `;

}


// ======================================================
// IP / URL ELEMENTS
// ======================================================

const ipInput =
    document.getElementById("ipInput");

const ageInput =
    document.getElementById("ageInput");

const ipCheckBtn =
    document.getElementById(
        "ipCheckBtn"
    );

const ipResultBox =
    document.getElementById(
        "ipResultBox"
    );


// ======================================================
// CHECK BUTTON
// ======================================================

ipCheckBtn.addEventListener(
    "click",
    checkIP
);


// ======================================================
// ENTER KEY
// ======================================================

ipInput.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            checkIP();

        }

    }
);


// ======================================================
// CHECK IP / URL
// ======================================================

async function checkIP() {

    const target =
        ipInput.value.trim();


    const days =
        Number(
            ageInput.value
        );


    if (!target) {

        alert(
            "Please enter an IP address or URL."
        );

        ipInput.focus();

        return;
    }


    ipCheckBtn.disabled =
        true;


    ipCheckBtn.textContent =
        "🌐 Checking...";


    ipResultBox.style.display =
        "block";


    ipResultBox.style.borderLeftColor =
        "#00d9ff";


    ipResultBox.innerHTML = `

        <div class="loading">

            🔎 Checking AbuseIPDB...

            <br><br>

            <small>

                Resolving the target and
                retrieving real threat intelligence.

            </small>

        </div>

    `;


    try {

        const response =
            await fetch(
                "/check-ip",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            target:
                                target,

                            maxAgeInDays:
                                days

                        })

                }
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to check target."
            );

        }


        renderIPResult(
            result
        );


    } catch (error) {

        ipResultBox.style.borderLeftColor =
            "#ff3155";


        ipResultBox.innerHTML = `

            <div class="danger-message">

                ❌
                <strong>
                    Check Failed
                </strong>

            </div>

            <br>

            ${escapeHTML(
                error.message
            )}

        `;

    } finally {

        ipCheckBtn.disabled =
            false;

        ipCheckBtn.textContent =
            "🌐 Check IP / URL";

    }

}


// ======================================================
// RENDER IP RESULT
// ======================================================

function renderIPResult(
    result
) {

    const data =
        result.data || {};


    const score =
        Number(
            data.abuseConfidenceScore || 0
        );


    const reports =
        Array.isArray(
            data.reports
        )
            ? data.reports
            : [];


    const totalReports =
        Number(
            data.totalReports || 0
        );


    const distinctReporters =
        Number(
            data.numDistinctUsers || 0
        );


    const risk =
        getRiskLevel(
            score
        );


    const scoreClass =
        getScoreClass(
            score
        );


    ipResultBox.style.borderLeftColor =
        score >= 50
            ? "#ff3155"
            : "#00e59b";


    ipResultBox.innerHTML = `

        <div class="result-title">

            🌐 AbuseIPDB Security Report

        </div>


        <div class="result-subtitle">

            Target:
            ${escapeHTML(
                result.searchedInput ||
                "Unknown"
            )}

            <br>

            Resolved IP:
            ${escapeHTML(
                result.resolvedIP ||
                data.ipAddress ||
                "Unknown"
            )}

        </div>


        <!-- SCORE -->

        <div class="score-container">

            <div class="
                score
                ${scoreClass}
            ">

                ${score}%

            </div>


            <div class="score-label">

                Abuse Confidence Score

            </div>

        </div>


        <!-- RISK -->

        <div class="risk-level">

            <span
                class="risk-badge"
                style="
                    background:
                    ${getRiskBackground(score)};
                    color:
                    ${getRiskColor(score)};
                "
            >

                ${risk}

            </span>

        </div>


        <!-- INFORMATION -->

        <div class="info-grid">


            ${createInfoCard(
                "IP Address",
                data.ipAddress ||
                result.resolvedIP ||
                "N/A"
            )}


            ${createInfoCard(
                "Country",
                data.countryName ||
                data.countryCode ||
                "N/A"
            )}


            ${createInfoCard(
                "ISP",
                data.isp ||
                "N/A"
            )}


            ${createInfoCard(
                "Usage Type",
                data.usageType ||
                "N/A"
            )}


            ${createInfoCard(
                "Domain",
                data.domain ||
                "N/A"
            )}


            ${createInfoCard(
                "Total Reports",
                totalReports
            )}


            ${createInfoCard(
                "Distinct Reporters",
                distinctReporters
            )}


            ${createInfoCard(
                "Last Reported",
                formatDate(
                    data.lastReportedAt
                )
            )}


            ${createInfoCard(
                "Tor",
                data.isTor
                    ? "Yes"
                    : "No"
            )}


            ${createInfoCard(
                "Whitelisted",
                data.isWhitelisted
                    ? "Yes"
                    : "No"
            )}

        </div>


        <!-- REPORTS -->

        <div class="reports-heading">

            <h3>
                📋 Abuse Reports
            </h3>

            <span class="report-count">

                ${
                    reports.length
                }
                report(s)

            </span>

        </div>


        <div class="report-window">

            Showing reports from the
            last

            <strong>
                ${result.reportWindow || "selected"}
            </strong>

            days.

        </div>


        ${
            reports.length > 0
                ? reports
                    .map(
                        (
                            report,
                            index
                        ) =>
                            createReport(
                                report,
                                index
                            )
                    )
                    .join("")
                : `

                    <div class="empty-reports">

                        ✅ No abuse reports found
                        for this target during
                        the selected period.

                    </div>

                `
        }

    `;

}


// ======================================================
// INFORMATION CARD
// ======================================================

function createInfoCard(
    title,
    value
) {

    return `

        <div class="info-card">

            <small>
                ${escapeHTML(
                    title
                )}
            </small>

            <strong>
                ${escapeHTML(
                    value
                )}
            </strong>

        </div>

    `;

}


// ======================================================
// CREATE REPORT
// ======================================================

function createReport(
    report,
    index
) {

    const categories =
        Array.isArray(
            report.categories
        )
            ? report.categories
            : [];


    const categoryHTML =
        categories
            .map(
                category => {

                    const categoryId =
                        typeof category === "object"
                            ? category.id
                            : category;


                    return `

                        <span class="category">

                            ${escapeHTML(
                                getCategoryName(
                                    categoryId
                                )
                            )}

                        </span>

                    `;

                }
            )
            .join("");


    const reporter =
        report.reporterId ||
        `Reporter ${index + 1}`;


    const country =
        report.reporterCountryName ||
        report.reporterCountryCode ||
        "Unknown";


    const date =
        formatDate(
            report.reportedAt
        );


    const comment =
        report.comment;


    return `

        <div class="report">

            <div class="report-top">

                <span class="reporter">

                    👤
                    ${escapeHTML(
                        reporter
                    )}

                </span>


                <span class="report-date">

                    ${escapeHTML(
                        date
                    )}

                </span>

            </div>


            <div class="report-country">

                🌍 Reporter Country:
                ${escapeHTML(
                    country
                )}

            </div>


            ${
                comment
                    ? `

                        <div class="report-comment">

                            💬
                            ${escapeHTML(
                                comment
                            )}

                        </div>

                    `
                    : ""
            }


            ${
                categoryHTML
                    ? categoryHTML
                    : ""
            }

        </div>

    `;

}


// ======================================================
// RISK LEVEL
// ======================================================

function getRiskLevel(
    score
) {

    if (score >= 75) {

        return "CRITICAL";

    }

    if (score >= 50) {

        return "HIGH";

    }

    if (score >= 25) {

        return "MEDIUM";

    }

    return "LOW";

}


// ======================================================
// SCORE CLASS
// ======================================================

function getScoreClass(
    score
) {

    if (score >= 75) {

        return "score-critical";

    }

    if (score >= 50) {

        return "score-high";

    }

    if (score >= 25) {

        return "score-medium";

    }

    return "score-low";

}


// ======================================================
// RISK COLOR
// ======================================================

function getRiskColor(
    score
) {

    if (score >= 75) {

        return "#ff3155";

    }

    if (score >= 50) {

        return "#ff7b54";

    }

    if (score >= 25) {

        return "#ffd166";

    }

    return "#00e59b";

}


// ======================================================
// RISK BACKGROUND
// ======================================================

function getRiskBackground(
    score
) {

    if (score >= 75) {

        return "rgba(255,49,85,0.12)";

    }

    if (score >= 50) {

        return "rgba(255,123,84,0.12)";

    }

    if (score >= 25) {

        return "rgba(255,209,102,0.12)";

    }

    return "rgba(0,229,155,0.10)";

}


// ======================================================
// ABUSEIPDB CATEGORY NAMES
// ======================================================

function getCategoryName(
    id
) {

    const categories = {

        1:
            "DNS Compromise",

        2:
            "DNS Poisoning",

        3:
            "Fraud Orders",

        4:
            "DDoS Attack",

        5:
            "FTP Brute-Force",

        6:
            "Ping of Death",

        7:
            "Phishing",

        8:
            "Fraud VoIP",

        9:
            "Open Proxy",

        10:
            "Web Spam",

        11:
            "Email Spam",

        12:
            "Blog Spam",

        13:
            "VPN IP",

        14:
            "Port Scan",

        15:
            "Hacking",

        16:
            "SQL Injection",

        17:
            "Spoofing",

        18:
            "Brute-Force",

        19:
            "Bad Web Bot",

        20:
            "Exploited Host",

        21:
            "Web App Attack",

        22:
            "SSH",

        23:
            "IoT Targeted",

        24:
            "DNS Server Attack",

        25:
            "ICMP Attack",

        26:
            "Ransomware",

        27:
            "Data Theft",

        28:
            "Exploit Public-Facing Application",

        29:
            "Malware",

        30:
            "Other"

    };


    return (
        categories[id] ||
        `Category ${id}`
    );

}


// ======================================================
// DATE FORMAT
// ======================================================

function formatDate(
    date
) {

    if (!date) {

        return "Not available";

    }


    try {

        return new Date(
            date
        ).toLocaleString();

    } catch {

        return String(
            date
        );

    }

}


// ======================================================
// HTML ESCAPING
// ======================================================

function escapeHTML(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}