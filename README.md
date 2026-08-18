<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Jack 的停車位小幫手 (Real-Time Parking)

即時整合 **臺北市**、**新北市**、**臺中市** 路邊停車格剩餘車位狀態查詢系統。

## 特色功能
- **臺北市**：串接「臺北市路邊停車格位使用情形」XML API，代理解析並提供短時間快取。
- **新北市**：串接新北市政府開放資料 API。
- **臺中市**：串接臺中市政府開放資料 API（地磁感測器）。

## 資料來源標註
- **臺北市**：資料來源：臺北市停車管理工程處 (臺北市資料大平臺)
- **新北市**：資料來源：新北市政府交通局 (新北市政府資料開放平台)
- **臺中市**：資料來源：臺中市政府交通局 (臺中市政府資料開放平台)

## 本地開發 (Run Locally)

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

