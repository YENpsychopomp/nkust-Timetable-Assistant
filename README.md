# 高科排課助手

這是一款基於 Electron 開發的桌面應用，主要用於輔助管理課表，方便使用者快速查詢與整理課程資訊。

---

## 主要功能

- 載入與解析學校提供的課程 CSV 檔案（init_class.csv、all_class.csv）
- 自動檢查課程資料是否完整，並提醒使用者進行設定
- 提供簡潔直觀的介面查看與管理課表

---

## 安裝與使用

1. 前往 [Releases](https://github.com/你的GitHub帳號/你的專案/releases) 頁面下載最新版本的安裝程式（.exe 檔案）。
2. 雙擊下載的安裝程式，依照指示完成安裝。
3. 執行安裝完成後的「課表助手」，首次啟動會提示你匯入課程資料。
4. 將學校下載的 `init_class.csv` 和 `all_class.csv` 放入指定資料夾，或依提示操作。
5. 即可開始使用，後續開啟程式會自動讀取課程資料。

---

## 開發環境與技術棧

- [Electron](https://www.electronjs.org/) - 桌面應用框架
- Node.js - 後端執行環境
- PapaParse - CSV 解析工具
- JavaScript / HTML / CSS - 前端技術

---

## 常見問題

### Q: 如何匯入課程資料？

A: 請至校務系統查詢以下兩份資料：

1. **自己的初始課表**（存成 `init_class.csv`）  
2. **自己系所年級的開課資訊**（存成 `all_class.csv`）

將這兩個 CSV 檔案放置於以下路徑（Windows 範例）：  
C:\Users{使用者名稱}\AppData\Roaming\schedule-app

---

#### 注意 CSV 欄位名稱須包含：

| 選課代號 | 上課校區 | 部別 | 科系 | 班級 | 合班班級 | 永久課號 | 科目名稱 | 學分 | 授課時數 | 實習時數 | 必/選 | 授課教師 | 教室 | 修課人數 | 人數上限 | 上課時間 | 全英語授課 | 遠距教學 | 備註 |
|---------|---------|-----|-----|-----|--------|--------|---------|-----|---------|---------|------|-------|-----|-------|-------|-------|--------|-------|-----|

---

#### 範例畫面：

![課程資料欄位範例](https://github.com/user-attachments/assets/c20966a8-113c-4a87-8605-0c793975018b)

---

請確保 CSV 格式及欄位正確，系統才能順利讀取並呈現課表資訊。


### Q: 遇到軟體無法啟動怎麼辦？
A: 請確認電腦已安裝相容的 Windows 環境，並允許防毒軟體執行本程式。

---

## 貢獻

歡迎任何形式的貢獻！請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md) 以了解如何參與。

---

## 授權條款

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/) license.  
You are free to use, copy, and modify the code for **non-commercial purposes only**.

For commercial licensing, please contact: 

---

## 聯絡方式

若有問題或建議，歡迎在 GitHub Issue 提出。

---

感謝您的支持！  
- 「課表助手」開發者
