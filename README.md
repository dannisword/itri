## 資料庫
IP:1
PORT:1433
資料庫:TENACITY
帳號:wms_itri
密碼:U100_wms

## VPN
IP:210.242.68.163
帳號:zhtech
密碼:503cjodkru4
連線軟體下載
https://210.242.68.163/global-protect/login.esp

## Git Path 
ssh://dannis@10.248.82.2/volume1/git/tenacity-iwms-frontend
Git 密碼為dannisdannis

## API URL
https://www.logistics.org.tw/tenacity/swagger-ui/index.html

## 前端測試網址
https://www.logistics.org.tw/tenacity-web/

- 文件
https://drive.google.com/drive/folders/1TbOsjzd-yjzAxxH3xPZWjAXpygIef0Ke
## 畫面
- 舊版
https://9bem8l.axshare.com

- 新版畫面
https://vrwbdo.axshare.com 

## 完成功能
- TND1000, 簽入/出作業 
- TND2000, 入庫作業,
- TND2001, 入庫工作,
- TND2002, 空箱入庫,
- TND3000, 出庫作業,
- TND3001, 出庫工作,
- TND3002, 空箱出庫,
- TND4000, 加工作業,
- TND4001, 加工工作,
- TND5000, 盤點作業,
- TND5001, 盤點工作,
- TND5002, 庫存異動工作,
- TND6000, 庫存查詢,
- TND7000, 設定,
- TND7001, 入庫開工設定,
- TND7002, 出庫開工設定,
- TND7003, 加工開工設定,
- TND7004, 盤點開工設定,
- TND7005, 個人帳號管理,
- TND7006, 站點管理,
- TND7007, 儲位管理,
- TND7008, 物流箱管理,
- TND7009, 使用者帳號管理,
- TND7010, 角色權限設定,

## Mqtt 處理
topic
itri/t12345/wcs3x/t12345/STN101
json data
{
  "carrier": "00026",
  "location": "STN101",
  "sensor": "BCR111"
}

dev: (目前是56那台)
itri/t12345/wcs2x/t12345/{station_code}
test: (目前是109那台)
itri/t12345/wcs3x/t12345/{station_code}
prod: (目前是外整那台)
itri/t12345/wcs4x/t12345/{station_code}

## 開發
npm run serve
