// dataLoader.js
const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");
const { app } = require("electron");

// 確保 userData 中的 CSV 存在，否則從 __dirname 的 data/ 複製
function ensureCSVInUserData(fileName) {
    const userDataPath = app.getPath("userData");
    const userCSVPath = path.join(userDataPath, fileName);
    const defaultCSVPath = path.join(__dirname, "data", fileName);

    if (!fs.existsSync(userCSVPath)) {
        fs.copyFileSync(defaultCSVPath, userCSVPath);
    }

    return userCSVPath;
}

function parseCSV(filePath) {
    let content = fs.readFileSync(filePath, "utf8");
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    const result = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
    });
    return result.data;
}

function loadInitClassCSV() {
    const filePath = ensureCSVInUserData("init_class.csv");
    return parseCSV(filePath);
}

function loadAllClassCSV() {
    const filePath = ensureCSVInUserData("all_class.csv");
    return parseCSV(filePath);
}

module.exports = {
    loadInitClassCSV,
    loadAllClassCSV,
};
