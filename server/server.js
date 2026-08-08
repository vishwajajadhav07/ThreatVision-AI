require("dotenv").config({ path: "./server/.env" });

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns").promises;

const app = express();
const PORT = 5000;

const ABUSEIPDB_API_KEY =
    process.env.ABUSEIPDB_API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------
// UPLOADS
// ----------------------------------------------------

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

        cb(
            null,
            `${Date.now()}-${safeName}`
        );
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
});

// ----------------------------------------------------
// FRONTEND
// ----------------------------------------------------

app.use(
    express.static(
        path.join(__dirname, "..")
    )
);

app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "..",
            "upload.html"
        )
    );
});

// ----------------------------------------------------
// API KEY
// ----------------------------------------------------

function apiKeyAvailable() {
    return (
        ABUSEIPDB_API_KEY &&
        ABUSEIPDB_API_KEY !==
            "PASTE_YOUR_ABUSEIPDB_API_KEY_HERE"
    );
}

// ----------------------------------------------------
// IP VALIDATION
// ----------------------------------------------------

function isIPAddress(value) {
    const ipv4 =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return (
        ipv4.test(value) ||
        (
            value.includes(":") &&
            /^[0-9a-fA-F:]+$/.test(value)
        )
    );
}

// ----------------------------------------------------
// CLEAN URL
// ----------------------------------------------------

function cleanTarget(target) {
    let value = String(target || "").trim();

    value = value.replace(
        /^https?:\/\//i,
        ""
    );

    value = value.replace(
        /^www\./i,
        ""
    );

    value = value.split("/")[0];

    if (
        value.includes(":") &&
        !isIPAddress(value)
    ) {
        value = value.split(":")[0];
    }

    return value.trim();
}

// ----------------------------------------------------
// RESOLVE DOMAIN TO IP
// ----------------------------------------------------

async function resolveTarget(target) {

    const cleaned = cleanTarget(target);

    if (isIPAddress(cleaned)) {

        return {
            input: target,
            ip: cleaned,
            type: "IP Address"
        };

    }

    const result = await dns.lookup(
        cleaned,
        {
            family: 4
        }
    );

    return {
        input: target,
        ip: result.address,
        type: "Domain / URL"
    };
}

// ----------------------------------------------------
// ABUSEIPDB REQUEST
// ----------------------------------------------------

async function abuseRequest(endpoint) {

    if (!apiKeyAvailable()) {
        throw new Error(
            "AbuseIPDB API key is not configured."
        );
    }

    const response = await fetch(
        `https://api.abuseipdb.com/api/v2/${endpoint}`,
        {
            method: "GET",

            headers: {
                "Accept": "application/json",
                "Key": ABUSEIPDB_API_KEY
            }
        }
    );

    let result;

    try {
        result = await response.json();
    } catch {
        result = {};
    }

    if (!response.ok) {

        const message =
            result?.errors?.[0]?.detail ||
            result?.message ||
            `AbuseIPDB error ${response.status}`;

        throw new Error(message);
    }

    return result;
}

// ----------------------------------------------------
// ABUSEIPDB CHECK
// ----------------------------------------------------

async function checkIP(ip, days) {

    const endpoint =
        `check?ipAddress=${encodeURIComponent(ip)}` +
        `&maxAgeInDays=${days}` +
        `&verbose`;

    const result =
        await abuseRequest(endpoint);

    return result.data || {};
}

// ----------------------------------------------------
// FORMAT REPORTS
// ----------------------------------------------------

function normalizeReports(reports) {

    if (!Array.isArray(reports)) {
        return [];
    }

    return reports.map((report, index) => {

        return {
            id: index + 1,

            reporterId:
                report.reporterId ??
                "Anonymous",

            reporterCountryCode:
                report.reporterCountryCode ||
                "N/A",

            reporterCountryName:
                report.reporterCountryName ||
                "Unknown",

            reportedAt:
                report.reportedAt ||
                null,

            comment:
                report.comment ||
                "No comment provided.",

            categories:
                Array.isArray(report.categories)
                    ? report.categories
                    : []
        };

    });
}

// ----------------------------------------------------
// IP / URL CHECK
// ----------------------------------------------------

app.post(
    "/check-ip",
    async (req, res) => {

        try {

            const target =
                String(
                    req.body?.target || ""
                ).trim();

            let days =
                Number(
                    req.body?.maxAgeInDays
                );

            if (
                ![30, 90, 365].includes(days)
            ) {
                days = 30;
            }

            if (!target) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter an IP address or URL."
                });

            }

            // Resolve URL/domain/IP
            const resolved =
                await resolveTarget(target);

            // Get AbuseIPDB information
            const abuseData =
                await checkIP(
                    resolved.ip,
                    days
                );

            // IMPORTANT:
            // AbuseIPDB returns the real reports
            // inside data.reports when verbose=true.

            const reports =
                normalizeReports(
                    abuseData.reports
                );

            console.log(
                "================================="
            );

            console.log(
                "ThreatVision IP CHECK"
            );

            console.log(
                "Input:",
                target
            );

            console.log(
                "Resolved IP:",
                resolved.ip
            );

            console.log(
                "Selected period:",
                days,
                "days"
            );

            console.log(
                "Total reports:",
                abuseData.totalReports
            );

            console.log(
                "Reports received:",
                reports.length
            );

            console.log(
                "================================="
            );

            return res.json({

                success: true,

                searchedInput:
                    target,

                resolvedIP:
                    resolved.ip,

                inputType:
                    resolved.type,

                reportWindow:
                    days,

                data: {

                    ipAddress:
                        abuseData.ipAddress ||
                        resolved.ip,

                    isPublic:
                        abuseData.isPublic ??
                        null,

                    ipVersion:
                        abuseData.ipVersion ??
                        null,

                    isWhitelisted:
                        abuseData.isWhitelisted ??
                        false,

                    abuseConfidenceScore:
                        Number(
                            abuseData.abuseConfidenceScore || 0
                        ),

                    countryCode:
                        abuseData.countryCode ||
                        "N/A",

                    countryName:
                        abuseData.countryName ||
                        "Unknown",

                    usageType:
                        abuseData.usageType ||
                        "Unknown",

                    isp:
                        abuseData.isp ||
                        "Unknown",

                    domain:
                        abuseData.domain ||
                        "N/A",

                    hostnames:
                        abuseData.hostnames ||
                        [],

                    isTor:
                        abuseData.isTor ||
                        false,

                    totalReports:
                        Number(
                            abuseData.totalReports || 0
                        ),

                    numDistinctUsers:
                        Number(
                            abuseData.numDistinctUsers || 0
                        ),

                    lastReportedAt:
                        abuseData.lastReportedAt ||
                        null,

                    reports:
                        reports
                }
            });

        } catch (error) {

            console.error(
                "IP CHECK ERROR:",
                error.message
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to check IP / URL."

            });

        }
    }
);

// ----------------------------------------------------
// FILE ANALYSIS
// ----------------------------------------------------

function analyzeFile(
    filePath,
    originalName
) {

    let content = "";

    try {

        const buffer =
            fs.readFileSync(filePath);

        content =
            buffer
                .subarray(
                    0,
                    5 * 1024 * 1024
                )
                .toString("utf8");

    } catch {
        content = "";
    }

    const lower =
        content.toLowerCase();

    const fileName =
        originalName.toLowerCase();

    const indicators = [];

    if (
        lower.includes("eicar") ||
        lower.includes(
            "eicar-standard-antivirus-test-file"
        )
    ) {
        indicators.push(
            "EICAR antivirus test signature"
        );
    }

    if (
        lower.includes("powershell")
    ) {
        indicators.push(
            "PowerShell command detected"
        );
    }

    if (
        lower.includes("invoke-expression")
    ) {
        indicators.push(
            "Invoke-Expression detected"
        );
    }

    if (
        lower.includes("downloadstring")
    ) {
        indicators.push(
            "PowerShell DownloadString detected"
        );
    }

    if (
        lower.includes("cmd.exe")
    ) {
        indicators.push(
            "Windows command execution detected"
        );
    }

    if (
        lower.includes("wscript.shell")
    ) {
        indicators.push(
            "Windows Script Shell detected"
        );
    }

    if (
        lower.includes("child_process")
    ) {
        indicators.push(
            "Node.js child_process detected"
        );
    }

    if (
        lower.includes("eval(")
    ) {
        indicators.push(
            "JavaScript eval() detected"
        );
    }

    if (
        lower.includes("fromcharcode")
    ) {
        indicators.push(
            "JavaScript obfuscation detected"
        );
    }

    if (
        lower.includes("rm -rf")
    ) {
        indicators.push(
            "Potentially destructive shell command detected"
        );
    }

    const suspiciousExtensions = [
        ".exe",
        ".dll",
        ".bat",
        ".cmd",
        ".scr",
        ".vbs",
        ".vbe",
        ".ps1",
        ".psm1",
        ".jse",
        ".jar",
        ".msi",
        ".hta",
        ".com"
    ];

    const extension =
        path.extname(fileName);

    if (
        suspiciousExtensions.includes(
            extension
        )
    ) {
        indicators.push(
            `Executable or script file type: ${extension}`
        );
    }

    const unique =
        [...new Set(indicators)];

    let riskLevel = "LOW";
    let threatDetected = false;

    if (unique.length > 0) {

        threatDetected = true;
        riskLevel = "HIGH";

    }

    if (unique.length >= 3) {
        riskLevel = "CRITICAL";
    }

    return {

        threatDetected,

        riskLevel,

        message:
            threatDetected
                ? "Suspicious security indicators were detected in the uploaded file."
                : "No obvious malicious indicators were detected.",

        indicators: unique

    };
}

// ----------------------------------------------------
// FILE SCAN
// ----------------------------------------------------

app.post(
    "/scan",
    upload.single("file"),
    async (req, res) => {

        let uploadedPath = null;

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No file was uploaded."
                });

            }

            uploadedPath =
                req.file.path;

            const result =
                analyzeFile(
                    uploadedPath,
                    req.file.originalname
                );

            try {
                fs.unlinkSync(
                    uploadedPath
                );
            } catch {}

            return res.json({

                success: true,

                file:
                    req.file.originalname,

                size:
                    req.file.size,

                threatDetected:
                    result.threatDetected,

                riskLevel:
                    result.riskLevel,

                message:
                    result.message,

                indicators:
                    result.indicators

            });

        } catch (error) {

            console.error(
                "FILE SCAN ERROR:",
                error.message
            );

            if (
                uploadedPath &&
                fs.existsSync(uploadedPath)
            ) {

                try {
                    fs.unlinkSync(
                        uploadedPath
                    );
                } catch {}

            }

            return res.status(500).json({

                success: false,

                message:
                    "File scanning failed."

            });
        }
    }
);

// ----------------------------------------------------
// START
// ----------------------------------------------------

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "======================================"
        );
        console.log(
            "        ThreatVision AI"
        );
        console.log(
            "======================================"
        );
        console.log(
            `Server running on port ${PORT}`
        );
        console.log(
            `http://localhost:${PORT}`
        );
        console.log(
            "======================================"
        );

        if (apiKeyAvailable()) {

            console.log(
                "AbuseIPDB API: CONFIGURED"
            );

        } else {

            console.log(
                "AbuseIPDB API: NOT CONFIGURED"
            );

        }

        console.log(
            "======================================"
        );
    }
);