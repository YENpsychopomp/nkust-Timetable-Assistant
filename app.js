// ===== 常數區 =====
const days = ["週一", "週二", "週三", "週四", "週五"];
const periods = ["M", "1", "2", "3", "4", "A", "5", "6", "7", "8", "9", "10"];
const weekdayMap = {
    "一": "週一",
    "二": "週二",
    "三": "週三",
    "四": "週四",
    "五": "週五",
};
const periodsTime = [
    "07:10-08:00",
    "08:10-09:00",
    "09:10-10:00",
    "10:10-11:00",
    "11:10-12:00",
    "12:10-13:00",
    "13:30-14:20",
    "14:30-15:20",
    "15:30-16:20",
    "16:30-17:20",
    "17:30-18:20",
    "18:30-19:20",
];
const pastelColors = [
    "#A3C9A8",
    "#87A986",
    "#B0C4A7",
    "#6B8F71",
    "#C3B091",
    "#9BA88D",
    "#DDE0D1",
    "#A89F91",
    "#BCCAB3",
    "#708B75",
];
const chineseDays = ["一", "二", "三", "四", "五"];
const addedCourses = new Set(); // 儲存已選課程名稱
const coursesTime = new Set(); // 儲存已選課程時間

// ===== 工具函式 =====
function createCell(content, className) {
    const div = document.createElement("div");
    div.className = `cell ${className}`;
    div.innerHTML = content.replace(/\n/g, "<br>");
    return div;
}

function isDarkColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 140;
}

function parsePeriodRange(periodStr) {
    /**
     * 解析表示節次範圍的字串，並回傳節數。
     *
     * @param {string} periodStr - 要解析的節次範圍字串，例如 "(四)2-4"。
     * @return {number} 回傳節數，若解析失敗則回傳 1。
     */
    const match = periodStr.match(/\((.)\)([A-Z\d]+)(?:-([A-Z\d]+))?/);
    if (!match) return 1;
    const allPeriods = periods;
    const start = match[2];
    const end = match[3] || start;
    const startIdx = allPeriods.indexOf(start);
    const endIdx = allPeriods.indexOf(end);
    return (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx)
        ? (endIdx - startIdx + 1)
        : 1;
}

function parseCompactTimeSlot(rawTime) {
    /**
     * 解析壓縮格式的時間區段字串，並轉換為標準化的時間區段陣列。
     *
     * @param {string} rawTime - 壓縮格式的時間區段字串，例如 "(一)A01-A03"。
     * @returns {string[]} 回傳標準化的時間區段陣列，例如 ["Monday-A01", "Monday-A02", "Monday-A03"]。若格式不符則回傳空陣列。
     */
    const match = rawTime.match(/\((.)\)([A0-9]+)-?([A0-9]+)?/);
    if (!match) return [];
    const [, dayChar, start, end] = match;
    const day = weekdayMap[dayChar];
    const startIdx = periods.indexOf(start);
    const endIdx = end ? periods.indexOf(end) : startIdx;

    if (day && startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
        return periods.slice(startIdx, endIdx + 1).map((p) => `${day}-${p}`);
    }
    return [];
}

function recoverGridCell(l) {
    const days = ["週一", "週二", "週三", "週四", "週五"];
    const grid = document.getElementById("schedule-grid");

    l.slice(1).forEach(([day, period]) => {
        console.log(`Recovering ${day} ${period}`);

        // 建立新 cell
        const cell = document.createElement("div");
        cell.className = "cell cell-block";
        cell.dataset.day = day;
        cell.dataset.period = period;
        cell.dataset.time = periodsTime[period] || "";

        // 找到 header cell（代表該節次開頭）
        const headerCell = grid.querySelector(
            `.cell.header[data-period="${period}"]`,
        );

        if (!headerCell) return;

        // 找同一節次中 day 的前一格
        const currentDayIndex = days.indexOf(day);
        if (currentDayIndex === 0) {
            // 週一：插在 header cell 下面
            headerCell.insertAdjacentElement("afterend", cell);
        } else {
            // 其他天：插在前一天的 cell 後面
            const prevDay = days[currentDayIndex - 1];
            const prevCell = grid.querySelector(
                `.cell-block[data-day="${prevDay}"][data-period="${period}"]`,
            );
            if (prevCell) {
                prevCell.insertAdjacentElement("afterend", cell);
            } else {
                // 找不到就退回插 header 後面
                headerCell.insertAdjacentElement("afterend", cell);
            }
        }
    });

    // 恢復第一個格子的樣式
    const day = l[0][0];
    const period = l[0][1];
    const cell1 = document.querySelector(
        `.cell-block[data-day='${day}'][data-period='${period}']`,
    );
    if (cell1) {
        cell1.removeAttribute("style");
    }
}

function addTimeToSet(timeText) {
    /**
     * 將時間字串加入到已選課程時間集合中。
     *
     * @param {string} timeText - 要加入的時間字串，例如 "周四-4"。
     */
    parseCompactTimeSlot(timeText).forEach((slot) => {
        const [day, period] = slot.split("-");
        coursesTime.add(`${day}-${period}`);
        // console.log(coursesTime);
    });
}

function removeTimeFromSet(timeText) {
    /**
     * 從已選課程時間集合中移除時間字串。
     *
     * @param {string} timeText - 要移除的時間字串，例如 "周四-4"。
     */
    parseCompactTimeSlot(timeText).forEach((slot) => {
        const [day, period] = slot.split("-");
        coursesTime.delete(`${day}-${period}`);
        // console.log(coursesTime);
    });
}

// ===== DOM 元素 =====
const { ipcRenderer } = require("electron");
window.$ = window.jQuery = require("jquery");
const scheduleGrid = document.getElementById("schedule-grid");
const courseList = document.getElementById("course-list");

async function checkCSVStatusOnStartup() {
    const isFirstTime = localStorage.getItem("hasOpenedBefore") !== "true";
    const result = await ipcRenderer.invoke("check-csv-status");

    if (isFirstTime || result.missing || result.noData) {
        let message = "";

        if (isFirstTime) {
            message += "這是您第一次使用本應用。<br><br>";
        }

        if (result.missing) {
            message +=
                "找不到 <code>init_class.csv</code> 或 <code>all_class.csv</code> 檔案。<br>";
        } else if (result.noData) {
            message +=
                "<code>all_class.csv</code> 檔案內容為空或格式異常。<br>";
        }

        message += `<br>請先登入校務系統查詢課程並填寫所需的 CSV 檔案。`;

        await Swal.fire({
            title: "尚未完成初始設定",
            html:
                `<div style="font-size: 15px; line-height: 1.6;">${message}</div>`,
            icon: "warning",
            confirmButtonText: "開啟檔案",
            confirmButtonColor: "#3085d6",
        });

        // 開啟 CSV 編輯用的檔案
        await ipcRenderer.invoke("open-file", "init_class.csv");
        await ipcRenderer.invoke("open-file", "all_class.csv");

        // 第一次開啟後設為已使用
        localStorage.setItem("hasOpenedBefore", "true");
    }
}

// ===== 課表網格建立 =====

// ===== 載入初始課表 =====
async function loadSchedule() {
    const emptyCell = createCell("", "header");
    emptyCell.dataset.period = "";
    scheduleGrid.appendChild(emptyCell);

    // 加入「星期」的標題列
    days.forEach((day) => {
        const dayHeader = createCell(day, "header");
        dayHeader.dataset.period = ""; // 表示這是 column header
        scheduleGrid.appendChild(dayHeader);
    });

    // 每一列：節次 + 每一天的格子
    periods.forEach((period, periodIdx) => {
        const periodLabel = `第${period}節\n${periodsTime[periodIdx] || ""}`;

        // 左側節次標題格
        const rowHeader = createCell(periodLabel, "header");
        rowHeader.dataset.period = period; // ✅ 加上 data-period
        scheduleGrid.appendChild(rowHeader);

        // 每一天的課表格子
        for (let i = 0; i < days.length; i++) {
            const cell = createCell("", "cell-block");
            cell.dataset.day = days[i];
            cell.dataset.period = period; // ✅ 加上 data-period
            cell.dataset.time = periodsTime[periodIdx] || "";
            scheduleGrid.appendChild(cell);
        }
    });
    const data = await ipcRenderer.invoke("get-init-class");
    data.forEach((course) => {
        const timeStr = course["上課時間"];
        addTimeToSet(timeStr);

        const match = timeStr.match(/\((.)\)(\d+)-(\d+)/);
        if (!match) return;
        const chineseDay = match[1];
        const startPeriod = match[2];
        const endPeriod = match[3];
        const periodsRange = periods.slice(
            periods.indexOf(startPeriod),
            periods.indexOf(endPeriod) + 1,
        );
        if (periodsRange.length === 0) return;
        const periodSpan = periodsRange.length;
        const dayLabel = "週" + chineseDay;
        const grid = document.getElementById("schedule-grid");
        const targetCell = Array.from(grid.children).find((cell) =>
            cell.dataset.day === dayLabel && cell.dataset.period === startPeriod
        );
        if (targetCell) {
            targetCell.innerHTML = "";
            const courseDiv = document.createElement("div");
            const bgColor =
                pastelColors[Math.floor(Math.random() * pastelColors.length)];
            courseDiv.style.color = isDarkColor(bgColor) ? "#fff" : "#000";
            courseDiv.className = "course-block";
            courseDiv.style.backgroundColor = bgColor;
            courseDiv.style.borderRadius = "8px";
            courseDiv.style.padding = "4px";
            courseDiv.style.width = "100%";
            courseDiv.style.height = "100%";
            courseDiv.style.fontSize = "14px";
            courseDiv.style.boxSizing = "border-box";
            courseDiv.style.display = "flex";
            courseDiv.style.flexDirection = "column";
            courseDiv.style.justifyContent = "center";
            courseDiv.style.alignItems = "center";
            courseDiv.style.textAlign = "center";
            courseDiv.setAttribute("data-canenable", "not");
            courseDiv.innerHTML = `
                <strong>${course["科目名稱"]}</strong><br>
                ${course["授課教師"]}<br>${course["教室"]}<br>
                <div class="time-slot" style="display: none">${
                (course["上課時間"] || "").trim()
            }</div>
            `;
            targetCell.appendChild(courseDiv);
            targetCell.style.gridRow = `span ${periodSpan}`;
            targetCell.style.position = "relative";
            targetCell.style.zIndex = "10";
            for (let i = 1; i < periodsRange.length; i++) {
                const toHide = Array.from(grid.children).find((cell) =>
                    cell.dataset.day === dayLabel &&
                    cell.dataset.period === periodsRange[i]
                );
                if (toHide) toHide.remove();
            }
        }
    });
}

function parseCompactDay(str) {
    const match = str.match(/\((.)\)/);
    if (!match) return -1;
    return chineseDays.indexOf(match[1]);
}

async function loadAllClass() {
    const data = await ipcRenderer.invoke("get-all-class");

    // 按照上課時間中的星期排序（例如 "(四)2-4" -> 星期四）
    data.sort((a, b) => {
        const timeA = a["上課時間"]?.trim() || "";
        const timeB = b["上課時間"]?.trim() || "";
        return parseCompactDay(timeA) - parseCompactDay(timeB);
    });

    data.forEach((course) => {
        const courseDiv = document.createElement("div");
        const duration = parsePeriodRange(course["上課時間"]);
        const bgColor =
            pastelColors[Math.floor(Math.random() * pastelColors.length)];
        courseDiv.style.color = isDarkColor(bgColor) ? "#fff" : "#000";
        courseDiv.className = "course-block list-block";
        courseDiv.style.backgroundColor = bgColor;
        courseDiv.style.borderRadius = "8px";
        courseDiv.style.padding = "4px";
        courseDiv.style.width = "75%";
        courseDiv.style.fontSize = "13px";
        courseDiv.style.boxSizing = "border-box";
        courseDiv.style.display = "flex";
        courseDiv.style.flexDirection = "column";
        courseDiv.style.justifyContent = "center";
        courseDiv.style.alignItems = "center";
        courseDiv.style.textAlign = "center";
        courseDiv.style.height = `${duration * 80}px`;
        courseDiv.innerHTML = `
          <div><strong>${(course["科目名稱"] || "").trim()}</strong></div>
          <div>${(course["授課教師"] || "").trim()}</div>
          <div>${(course["教室"] || "").trim()}</div>
          <div class="time-slot">${(course["上課時間"] || "").trim()}</div>
          <div class="code">${(course["選課代號"] || "").trim()}</div>
          <div style="display: none" id="course-code">${
            (course["選課代號"] || "").trim()
        }</div>
        `;
        courseList.appendChild(courseDiv);
    });

    updateCourseSelectable();
}

// ===== 課程衝突檢查 =====
function updateCourseSelectable(obj) {
    const occupiedSlots = new Set();

    document.querySelectorAll(".schedule-grid .cell.cell-block .time-slot")
        .forEach((slotEl) => {
            const rawTime = slotEl.textContent.trim();
            const slots = parseCompactTimeSlot(rawTime);
            slots.forEach((slot) => occupiedSlots.add(slot));
        });

    // ⛔ 關鍵：這裡必須用 parseCompactTimeSlot 來解析右側課程的時間
    document.querySelectorAll("#course-list .course-block").forEach((block) => {
        const rawTime =
            block.querySelector(".time-slot")?.textContent?.trim() || "";
        const slots = parseCompactTimeSlot(rawTime);
        const hasConflict = slots.some((slot) => occupiedSlots.has(slot));

        if (hasConflict) {
            block.style.opacity = "0.4";
            block.style.pointerEvents = "none";
        } else {
            block.style.opacity = "1";
            block.style.pointerEvents = "auto";
        }
    });
    // 如果有傳入 obj，則更新該特定課程的可選狀態
    if (obj) {
        const rawTime = $(obj).find(".time-slot").text().trim();
        const slots = parseCompactTimeSlot(rawTime);
        const hasConflict = slots.some((slot) => occupiedSlots.has(slot));

        if (hasConflict) {
            $(obj).css({
                opacity: "1",
                pointerEvents: "auto",
            });
        }
    }
}

$("#course-list").on("click", ".list-block", function (e) {
    const courseName = $(this).find("#course-code").text().trim();

    if (addedCourses.has(courseName)) {
        if (confirm("你已選過此課程！是否要取消選擇？")) {
            // 取消已選課程
            addedCourses.delete(courseName);
            removeTimeFromSet($(this).find(".time-slot").text().trim());
            console.log(coursesTime);

            // 從課表移除該課程
            const timeText = $(this).find(".time-slot").text().trim();
            const timeSlots = parseCompactTimeSlot(timeText);
            const a = [];
            timeSlots.forEach((slot) => {
                const [day, period] = slot.split("-");
                a.push([day, period]);
                $(`.cell-block[data-day='${day}'][data-period='${period}'] .cell-block-inner`)
                    .remove();
            });
            recoverGridCell(a);
            updateCourseSelectable();
            // 右側課程樣式恢復
            $(this).css("border", "");
            return;
        } else {
            return;
        }
    }

    const timeText = $(this).find(".time-slot").text().trim(); // (四)2-4
    const timeSlots = parseCompactTimeSlot(timeText);
    console.log("timeSlots:", timeSlots);
    addTimeToSet(timeText);

    timeSlots.forEach((slot) => {
        const [day, period] = slot.split("-");
        const cell = $(
            `.cell-block[data-day='${day}'][data-period='${period}']`,
        );

        if (cell.length) {
            const block = $(this).clone().css({
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                opacity: "1",
            });
            console.log(block);

            block.removeClass("list-block").addClass("cell-block-inner");
            cell.append(block);
        }
    });
    handleCourseSelection($(this));
    addedCourses.add(courseName); // 記錄已加入
    $(this).css("border", "5px solid rgb(61, 144, 131)"); // 可選：右側變灰表示已選
    updateCourseSelectable(this);
});

function handleCourseSelection($block) {
    const courseName = $block.find("#course-code").text().trim();

    const timeText = $block.find(".time-slot").text().trim(); // e.g. (四)2-4
    const match = timeText.match(/\((.)\)(\d+)-(\d+)/);

    if (!match) return;

    const chineseDay = match[1]; // e.g. "四"
    const startPeriod = match[2];
    const endPeriod = match[3];
    const periodsRange = periods.slice(
        periods.indexOf(startPeriod),
        periods.indexOf(endPeriod) + 1,
    );

    if (periodsRange.length === 0) return;

    const periodSpan = periodsRange.length;
    const dayLabel = "週" + chineseDay;
    const grid = document.getElementById("schedule-grid");

    const targetCell = Array.from(grid.children).find(
        (cell) =>
            cell.dataset.day === dayLabel &&
            cell.dataset.period === startPeriod,
    );

    if (!targetCell) return;

    // 建立課程格
    const courseDiv = document.createElement("div");
    const bgColor =
        pastelColors[Math.floor(Math.random() * pastelColors.length)];

    courseDiv.className = "course-block cell-block-inner";
    courseDiv.style.color = isDarkColor(bgColor) ? "#fff" : "#000";
    courseDiv.style.backgroundColor = bgColor;
    courseDiv.style.borderRadius = "8px";
    courseDiv.style.padding = "4px";
    courseDiv.style.width = "100%";
    courseDiv.style.height = "100%";
    courseDiv.style.fontSize = "14px";
    courseDiv.style.boxSizing = "border-box";
    courseDiv.style.display = "flex";
    courseDiv.style.flexDirection = "column";
    courseDiv.style.justifyContent = "center";
    courseDiv.style.alignItems = "center";
    courseDiv.style.textAlign = "center";

    const lines = $block.text().split("\n").map((t) => t.trim()).filter((t) =>
        t.length > 0
    );
    // console.log(lines);

    const subject = lines[0] || "";
    const teacher = lines[1] || "";
    const room = lines[2] || "";
    courseDiv.innerHTML = `
    <strong>${subject}</strong><br>
    ${teacher}<br>
    <div class="time-slot" style="display: none">${timeText}</div>
`;

    courseDiv.innerHTML = `
        <strong>${subject}</strong><br>
        ${teacher}<br>${room}<br>
        <div class="time-slot" style="display: none">${timeText}</div>
    `;

    // 塞進第一格
    targetCell.innerHTML = "";
    targetCell.appendChild(courseDiv);
    targetCell.style.gridRow = `span ${periodSpan}`;
    targetCell.style.position = "relative";
    targetCell.style.zIndex = "10";

    // 隱藏其餘格
    for (let i = 1; i < periodsRange.length; i++) {
        const toHide = Array.from(grid.children).find(
            (cell) =>
                cell.dataset.day === dayLabel &&
                cell.dataset.period === periodsRange[i],
        );
        if (toHide) toHide.remove();
    }

    addedCourses.add(courseName);
    $block.css("border", "5px solid rgb(61, 144, 131)");
}

document.getElementById("edit-init-btn").addEventListener("click", () => {
    Swal.fire({
        title: "請編輯初始課表",
        html: `
            <div style="font-size: 15px; line-height: 1.6;">
                請先登入學校校務系統查詢自己的初始課表，<br>
                並將課程資料填入 <code>init_class.csv</code> 後再返回本系統繼續操作。
            </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "開啟 init_class.csv",
        cancelButtonText: "稍後再說",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
    }).then((result) => {
        if (result.isConfirmed) {
            ipcRenderer.invoke("open-file", "init_class.csv");
        }
    });
});

document.getElementById("edit-all-btn").addEventListener("click", () => {
    Swal.fire({
        title: "請自行查詢開課資料",
        html: `
            <div style="font-size: 15px; line-height: 1.6;">
                請先登入學校校務系統查詢最新開課資訊，<br>
                並將課程資料填入 <code>all_class.csv</code> 後再返回本系統繼續操作。
            </div>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "開啟 all_class.csv",
        cancelButtonText: "稍後再說",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#aaa",
    }).then((result) => {
        if (result.isConfirmed) {
            ipcRenderer.invoke("open-file", "all_class.csv");
        }
    });
});

// ===== 初始化 =====
loadSchedule();
loadAllClass();
checkCSVStatusOnStartup();
