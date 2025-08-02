/**
 * ===== 開發者備註區 =====
 *
 * 這裡是給開發者的備註或留言區，可以用來記錄 TODO、BUG、設計說明等。
 *
 * - 若要調整課表顏色，請修改 pastelColors 陣列。
 * - 課表時間格式請參考 parseCompactTimeSlot 的說明。
 * - 若需擴充支援更多天或節次，請同步調整 days、periods、periodsTime 等常數。
 * - 若有任何疑問或建議，請於此區留言。
 *
 * 目前已知問題:
 * addedCourses 儲存的是 coursesCode，請確保所有操作時變數名稱一致（coursesCode）。
 * 右方同時存在#coursesCode與data-course-id
 * ======================
 */

// ===== 常數區 =====
const days = ["週一", "週二", "週三", "週四", "週五"];
const periods = ["M", "1", "2", "3", "4", "A", "5", "6", "7", "8", "9", "10"];
const weekdayMap = Object.fromEntries(
	days.map((day, idx) => [day.replace("週", ""), day])
);
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
const lightModeDict = {
	"--main-bg-color": "#f5f7fa",
	"--white": "#fff",
	"--light-bg": "#f0f4f8",
	"--border-color": "#ddd",
	"--shadow": "0 8px 16px rgba(0, 0, 0, 0.1)",
	"--header-color": "#333",
	"--primary": "#007bff",
	"--button-bg": "#548086",
	"--button-hover-shadow": "0 6px 12px rgba(30, 93, 204, 0.25)",
	"--button-shadow": "0 4px 8px rgba(63, 134, 255, 0.2)",
	"--button-color": "#fff",
	"--cell-selected-bg": "#c8e1ff",
	"--unselectable-bg": "#ccc",
	"--unselectable-color": "#666",
	"--setting-bg": "#ffffff",
	"--setting-hover-bg": "#e0f0ff",
	"--setting-hover-color": "#007bff",
	"--setting-page-bg": "#fdfdfd",
	"--setting-page-title": "#333",
	"--setting-group-btn-bg": "#e0e0e0",
	"--setting-group-btn-hover-bg": "#3c715a",
	"--setting-group-btn-hover-color": "#fff",
	"--setting-info-color": "#999",
	"--switch-bg": "#e0e0e0",
	"--switch-hover-bg": "#303231",
	"--switch-hover-color": "#fff",
	"--slider-bg": "#ccc",
	"--slider-checked-bg": "#007bff",
	"--slider-ball-bg": "#fff",
	"--course-list-bg": "#f8f8f8",
	"--course-list-scrollbar-thumb": "#bbb",
	"--course-list-scrollbar-thumb-hover": "#999",
	"--course-list-scrollbar-track": "#f3f3f3",
	"--course-list-border": "#ccc"
};
const darkModeDict = {
	"--main-bg-color": "#2d2f31",
	"--white": "#232426",
	"--light-bg": "#35373a",
	"--border-color": "#555",
	"--shadow": "0 8px 16px rgba(0, 0, 0, 0.3)",
	"--header-color": "#e0e0e0",
	"--primary": "#3399ff",
	"--button-bg": "#3c5a5e",
	"--button-hover-shadow": "0 6px 12px rgba(30, 93, 204, 0.25)",
	"--button-shadow": "0 4px 8px rgba(63, 134, 255, 0.2)",
	"--button-color": "#e0e0e0",
	"--cell-selected-bg": "#3a4c64",
	"--unselectable-bg": "#555",
	"--unselectable-color": "#bbb",
	"--setting-bg": "#6e7276ff",
	"--setting-hover-bg": "#3a4c64",
	"--setting-hover-color": "#3399ff",
	"--setting-page-bg": "#2d2f31",
	"--setting-page-title": "#e0e0e0",
	"--setting-group-btn-bg": "#444",
	"--setting-group-btn-hover-bg": "#3399ff",
	"--setting-group-btn-hover-color": "#fff",
	"--setting-info-color": "#aaa",
	"--switch-bg": "#444",
	"--switch-hover-bg": "#3399ff",
	"--switch-hover-color": "#fff",
	"--slider-bg": "#555",
	"--slider-checked-bg": "#3399ff",
	"--slider-ball-bg": "#232426",
	"--course-list-bg": "#2d2f31",
	"--course-list-scrollbar-thumb": "#555",
	"--course-list-scrollbar-thumb-hover": "#3399ff",
	"--course-list-scrollbar-track": "#35373a",
	"--course-list-border": "#555"
};
const chineseDays = ["一", "二", "三", "四", "五"];
const addedCourses = new Set(); // 儲存已選課程名稱
const coursesTime = new Set(); // 儲存已選課程時間
const tipsPage = document.getElementById("tips-page");

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
	return startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx
		? endIdx - startIdx + 1
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
			`.cell.header[data-period="${period}"]`
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
				`.cell-block[data-day="${prevDay}"][data-period="${period}"]`
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
		`.cell-block[data-day='${day}'][data-period='${period}']`
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
			message += "<code>all_class.csv</code> 檔案內容為空或格式異常。<br>";
		}

		message += `<br>請先登入校務系統查詢課程並填寫所需的 CSV 檔案。`;

		await Swal.fire({
			title: "尚未完成初始設定",
			html: `<div style="font-size: 15px; line-height: 1.6;">${message}</div>`,
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
	emptyCell.style.borderTopLeftRadius = "12px";
	scheduleGrid.appendChild(emptyCell);

	// 加入「星期」的標題列
	days.forEach((day) => {
		const dayHeader = createCell(day, "header");
		console.log(`Adding header for ${day}`);
		if (day === "週五") dayHeader.style.borderTopRightRadius = "12px";
		dayHeader.dataset.period = ""; // 表示這是 column header
		scheduleGrid.appendChild(dayHeader);
	});

	// 每一列：節次 + 每一天的格子
	periods.forEach((period, periodIdx) => {
		const periodLabel = `第${period}節\n${periodsTime[periodIdx] || ""}`;

		// 左側節次標題格
		const rowHeader = createCell(periodLabel, "header");
		rowHeader.dataset.period = period; // ✅ 加上 data-period
		if (period === "10") rowHeader.style.borderBottomLeftRadius = "12px";
		scheduleGrid.appendChild(rowHeader);

		// 每一天的課表格子
		for (let i = 0; i < days.length; i++) {
			const cell = createCell("", "cell-block");
			cell.dataset.day = days[i];
			cell.dataset.period = period; // ✅ 加上 data-period
			cell.dataset.time = periodsTime[periodIdx] || "";
			if (i === days.length - 1 && period === "10") cell.style.borderBottomRightRadius = "12px";
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
			periods.indexOf(endPeriod) + 1
		);
		if (periodsRange.length === 0) return;
		const periodSpan = periodsRange.length;
		const dayLabel = "週" + chineseDay;
		const grid = document.getElementById("schedule-grid");
		const targetCell = Array.from(grid.children).find(
			(cell) =>
				cell.dataset.day === dayLabel && cell.dataset.period === startPeriod
		);
		const bgColor =
			pastelColors[Math.floor(Math.random() * pastelColors.length)];
		if (targetCell) {
			targetCell.innerHTML = "";
			const courseDiv = document.createElement("div");
			if (course["color"]) {
				// 如果有指定顏色，則使用指定顏色
				course["color"] = course["color"].trim();
			} else {
				// 否則隨機選擇一個顏色
				course["color"] =
					pastelColors[Math.floor(Math.random() * pastelColors.length)];
			}
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
			courseDiv.setAttribute("data-cancancel", false);
			courseDiv.innerHTML = `
                <strong>${course["科目名稱"]}</strong><br>
                ${course["授課教師"]}<br>${course["教室"]}<br>
                <div class="time-slot" style="display: none">${(
					course["上課時間"] || ""
				).trim()}</div>
            `;
			// 設定 dataset 屬性，方便 tooltip 使用
			courseDiv.dataset.code = course["選課代號"] || "未知課號";
			courseDiv.dataset.name = course["科目名稱"] || "未知課程";
			courseDiv.dataset.teacher = course["授課教師"] || "未知老師";
			courseDiv.dataset.room = course["教室"] || "未知教室";
			courseDiv.dataset.period = course["上課時間"] || "節次不明";
			courseDiv.dataset.isEnglish = course["全英語授課"] || "未知";
			targetCell.appendChild(courseDiv);
			targetCell.style.gridRow = `span ${periodSpan}`;
			targetCell.style.position = "relative";
			targetCell.style.zIndex = "10";
			for (let i = 1; i < periodsRange.length; i++) {
				const toHide = Array.from(grid.children).find(
					(cell) =>
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
		courseDiv.style.border = `5px solid transparent`;
		courseDiv.dataset.courseId = (course["選課代號"] || "").trim();
		courseDiv.innerHTML = `
          <div><strong>${(course["科目名稱"] || "").trim()}</strong></div>
          <div>${(course["授課教師"] || "").trim()}</div>
          <div>${(course["教室"] || "").trim()}</div>
          <div class="time-slot">${(course["上課時間"] || "").trim()}</div>
          <div class="code">${(course["選課代號"] || "").trim()}</div>
          <div style="display: none" id="course-code">${(
				course["選課代號"] || ""
			).trim()}</div>
        `;
		// 移除 key 中有特殊字元（如 \t）的屬性
		const cleanCourse = {};
		Object.keys(course).forEach((key) => {
			const cleanKey = key.replace(/[\t\n\r]/g, "");
			const value = typeof course[key] === "string" ? course[key].trim() : course[key];
			cleanCourse[cleanKey] = value;
		});
		courseDiv.dataset.info = JSON.stringify(cleanCourse);
		courseList.appendChild(courseDiv);
	});
	setupCourseTips();
	updateCourseSelectable();
}

// ===== 課程衝突檢查 =====
function updateCourseSelectable(obj) {
	const occupiedSlots = new Set();

	// 將以加入至左邊課表的時間段儲存至 occupiedSlots
	document
		.querySelectorAll(".schedule-grid .cell.cell-block .time-slot")
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
		const courseId = $(block).attr("data-course-id");

		// const courseCode = $(this).attr("data-course-id");
		const hasConflict = slots.some((slot) => occupiedSlots.has(slot));

		const isAlreadyAdded = addedCourses.has(courseId); // ✅ 課程是否已加入課表

		// 若衝堂但這門課是自己加的，則保持可點擊
		if (hasConflict && !isAlreadyAdded) {
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
	const courseCode = $(this).attr("data-course-id");

	if (addedCourses.has(courseCode)) {
		if (confirm("你已選過此課程！是否要取消選擇？")) {
			// 取消已選課程
			addedCourses.delete(courseCode);
			removeTimeFromSet($(this).find(".time-slot").text().trim());
			console.log(coursesTime);
			console.log(addedCourses);

			// 從課表移除該課程
			const timeText = $(this).find(".time-slot").text().trim();
			const timeSlots = parseCompactTimeSlot(timeText);
			const a = [];
			timeSlots.forEach((slot) => {
				const [day, period] = slot.split("-");
				a.push([day, period]);
				$(
					`.cell-block[data-day='${day}'][data-period='${period}'] .cell-block-inner`
				).remove();
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
		const cell = $(`.cell-block[data-day='${day}'][data-period='${period}']`);

		if (cell.length) {
			const block = $(this).clone().css({
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				opacity: "1",
			});

			block.removeClass("list-block").addClass("cell-block-inner");
			cell.append(block);
		}
	});
	handleCourseSelection($(this));
	addedCourses.add(courseCode); // 記錄已加入
	$(this).css("border-color", "rgba(205, 116, 71, 1)"); // 可選：右側變灰表示已選
	setupCourseTips(this);
	updateCourseSelectable(this);
});

function handleCourseSelection($block) {
	const blockData = JSON.parse($block.attr("data-info"));
	const courseCode = blockData["選課代號"] || "未知課號";
	const timeText = blockData["上課時間"].trim(); // e.g. (四)2-4
	const match = timeText.match(/\((.)\)(\d+)-(\d+)/);
	console.log(blockData);

	if (!match) return;

	const chineseDay = match[1]; // e.g. "四"
	const startPeriod = match[2];
	const endPeriod = match[3];
	const periodsRange = periods.slice(
		periods.indexOf(startPeriod),
		periods.indexOf(endPeriod) + 1
	);

	if (periodsRange.length === 0) return;

	const periodSpan = periodsRange.length;
	const dayLabel = "週" + chineseDay;
	const grid = document.getElementById("schedule-grid");

	const targetCell = Array.from(grid.children).find(
		(cell) =>
			cell.dataset.day === dayLabel && cell.dataset.period === startPeriod
	);

	if (!targetCell) return;

	// 建立課程格
	const courseDiv = document.createElement("div");
	const bgColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

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
	// 設定 dataset 屬性，方便 tooltip 使用
	courseDiv.dataset.code = blockData["選課代號"] || "未知課號";
	courseDiv.dataset.name = blockData["科目名稱"] || "未知課程";
	courseDiv.dataset.teacher = blockData["授課教師"] || "未知老師";
	courseDiv.dataset.room = blockData["教室"] || "未知教室";
	courseDiv.dataset.period = timeText;
	courseDiv.dataset.isEnglish = blockData["全英語授課"] || "否";
	const lines = $block
		.text()
		.split("\n")
		.map((t) => t.trim())
		.filter((t) => t.length > 0);

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
				cell.dataset.day === dayLabel && cell.dataset.period === periodsRange[i]
		);
		if (toHide) toHide.remove();
	}

	addedCourses.add(courseCode);
	$block.css("border", "5px solid rgb(61, 144, 131)");
}

$("#setting").on("click", (e) => {
	const $page = $("#settingPage");
	const wasActive = $page.hasClass("active");
	$page.toggleClass("active");
	if (!wasActive) {
		// 點擊非 #settingPage 區域時關閉
		$(document).on("mousedown.settingPage", function (e2) {
			if (
				!$(e2.target).closest("#settingPage, #setting").length
			) {
				$page.removeClass("active");
				$(document).off("mousedown.settingPage");
			}
		});
	} else {
		$(document).off("mousedown.settingPage");
	}
});

// 編輯 CSV
$("#editInitCSV").on("click", () => {
	ipcRenderer.invoke("open-file", "init_class.csv");
});

$("#editAllCSV").on("click", () => {
	ipcRenderer.invoke("open-file", "all_class.csv");
});

// 匯入預設檔（從 /data 覆蓋到 userData）
$("#resetCSV").on("click", async () => {
	const confirmed = await Swal.fire({
		title: "確定要匯入預設課表？",
		text: "這會覆蓋你目前的課表資料",
		icon: "warning",
		showCancelButton: true,
		confirmButtonText: "確定",
		cancelButtonText: "取消",
	});

	if (confirmed.isConfirmed) {
		await ipcRenderer.invoke("reset-csv");
		Swal.fire("完成", "已成功匯入預設資料", "success");
	}
});

// 檢查 CSV 狀態
$("#checkCSV").on("click", async () => {
	const result = await ipcRenderer.invoke("check-csv-status");
	if (result.missing) {
		Swal.fire("缺少檔案", "找不到 init_class.csv 或 all_class.csv", "error");
	} else if (result.noData) {
		Swal.fire("格式錯誤", "資料有誤或為空", "warning");
	} else {
		Swal.fire("資料正常", "CSV 檔案與內容都 OK！", "success");
	}
});

$("#toggleDark").on("change", function () {
	if ($(this).is(":checked")) {
		// 切換到深色模式
		Object.entries(darkModeDict).forEach(([key, value]) => {
			document.documentElement.style.setProperty(key, value);
		});
		localStorage.setItem("theme", "dark");
	} else {
		Object.entries(lightModeDict).forEach(([key, value]) => {
			document.documentElement.style.setProperty(key, value);
		});
		localStorage.setItem("theme", "light");
	}
});

$("#devMode").on("click", () => {
	ipcRenderer.invoke("open-devtool");
});

function showTips(courseBlock, event) {
	const courseCode = courseBlock.dataset.code || "未知課號";
	const courseName = courseBlock.dataset.name || "未知課程";
	const teacher = courseBlock.dataset.teacher || "未知老師";
	const room = courseBlock.dataset.room || "未知教室";
	const period = courseBlock.dataset.period || "節次不明";
	const isEnglish = courseBlock.dataset.isEnglish || "未知";

	// 填入內容
	tipsPage.innerHTML = `
        <strong>${courseName}</strong><br>
        課號：${courseCode}<br>
        教師：${teacher}<br>
        教室：${room}<br>
        節次：${period}<br>
		全英語授課：${isEnglish}<br>
    `;

	// 位置與顯示
	tipsPage.style.display = "block";
	tipsPage.style.left = event.pageX + 15 + "px";
	tipsPage.style.top = event.pageY + 15 + "px";
}

function hideTips() {
	tipsPage.style.display = "none";
}

function addBlockListener(block) {
	block.addEventListener("mousemove", (e) => {
		showTips(block, e);
	});

	block.addEventListener("mouseleave", hideTips);
}

function setupCourseTips() {
	const courseBlocks = document.querySelectorAll(
		"#schedule-grid .course-block"
	);

	courseBlocks.forEach((block) => {
		addBlockListener(block);
	});
}

// ===== 初始化 =====

loadSchedule();
loadAllClass();
checkCSVStatusOnStartup();
