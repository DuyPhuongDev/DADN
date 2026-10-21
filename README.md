# 🌱 DADN - Smart Garden System

Hệ thống Smart Garden giúp giám sát và quản lý vườn cây thông minh theo thời gian thực, gồm ứng dụng mobile, backend API và luồng dữ liệu IoT.

## 🧩 Kiến trúc tổng quan

![Smart Garden Architecture](https://github.com/user-attachments/assets/94effcb9-ebdc-40a3-a84f-250883cb4c40)

Luồng chính:
- Sensor gửi dữ liệu qua **IoT Gateway** lên **Adafruit/MQTT**
- Dữ liệu được đẩy vào **Kafka (raw data)** theo định dạng **Avro**
- **Flink** xử lý stream dữ liệu và ghi ra hệ thống lưu trữ/queue
- Backend **Spring Boot** consume dữ liệu, cung cấp API cho ứng dụng **React Native**

## 🚀 Thành phần trong repository

- `be/`: Backend API với Spring Boot, Spring Security, JPA, PostgreSQL, MQTT
- `smart-garden/`: Ứng dụng mobile React Native (Expo)
- `docker-compose.yml`: Chạy nhanh backend qua Docker

## 🛠️ Công nghệ sử dụng

- **Backend:** Java 17, Spring Boot 3, Spring Security, JPA, PostgreSQL, MQTT (Paho), JWT
- **Mobile:** React Native, Expo, TypeScript, React Query
- **Data pipeline (kiến trúc):** MQTT, Kafka, Avro, Flink

## ⚙️ Chạy dự án

### 1) Chạy backend bằng Docker

Tại thư mục gốc, cấu hình các biến môi trường trong `docker-compose.yml`:
- `AIO_USERNAME`, `AIO_KEY`, `MQTT_BROKER`, `CLIENT_ID`
- `JWT_SECRETKEY`
- `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`

Sau đó chạy:

```bash
docker compose up --build
```

Backend mặc định chạy ở: `http://localhost:9999/api/v1`

### 2) Chạy mobile app

```bash
cd smart-garden
npm install
npm start
```

## 🔐 Một số API chính (backend)

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/gardens`
- `POST /api/v1/gardens/create`
- `GET /api/v1/devices/sensors`
- `POST /api/v1/devices/sensor`
- `POST /api/v1/devices/pump`
- `GET /api/v1/tasks`
- `POST /api/v1/tasks/create`
- `POST /api/v1/notifications/send`

## 📌 Ghi chú

- Backend cấu hình port mặc định `9999`.
- Ứng dụng mobile gọi API qua biến môi trường trong thư mục `smart-garden`.
