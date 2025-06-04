# 🌱 Smart Farm System

🚀 Backend server hệ thống giám sát cây trồng thông minh với Spring Boot.

## 🔥 Tính năng chính
- 🌡️ Theo dõi nhiệt độ, độ ẩm real-time
- 📢 Cảnh báo khi nhiệt độ > 40°C
- 📊 Biểu đồ trực quan trên mobile app

## 📦 Cài đặt

```sh
git clone https://github.com/DuyPhuongDev/smart-farm-be.git
cd smart-farm-be
./mvnw spring-boot:run
```
##  📄 API end point


### Base URLs:

* <a href="http://localhost:9999/api/v1">Develop Env: http://localhost:9999/api/v1</a>

### Authentication

- HTTP Authentication, scheme: bearer

### GET Get all pump history

    GET /pump-history

### GET Get pump history by device id

    GET /pump-history/device/3

### POST Add DeviceToken

    POST /device-tokens/token

> Body Parameters

```json
{
  "userId": 1,
  "deviceToken": "adsjkadansjda"
}
```

### POST send notification

    POST /notifications/send

> Body Parameters

```json
{
  "deviceToken": "ExponentPushToken[expo_push_token]",
  "title": "🔥 Cảnh báo!",
  "body": "Nhiệt độ quá cao, kiểm tra ngay!"
}
```

### POST register

    POST /users/register


### POST login

    POST /users/login

> Body Parameters

```json
{
  "email": "ssaas@example.com",
  "password": "jgcjhghjjhhjbjhj"
}
```

### POST add device

    POST /devices/create

> Body Parameters

```json
{
  "name": "pump",
  "feed": "/feed/pump",
  "location": "HCMUT"
}
```

### GET get all devices

    GET /devices
 

### GET Get device by Id

    GET /devices/{id}

#### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|path|integer| yes |none|


### GET Get temperature

    GET /sensor-data/temperature

### GET Get humidity

    GET /sensor-data/humidity

### GET Get lux

    GET /sensor-data/lux


