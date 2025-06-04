# # Sử dụng OpenJDK 17
# FROM openjdk:17-jdk-slim

# # Thiết lập thư mục làm việc
# WORKDIR /app

# # Sao chép file JAR từ dự án vào container
# COPY target/be-0.0.1-SNAPSHOT.jar app.jar

# EXPOSE 9999

# # Chạy ứng dụng Spring Boot
# CMD ["java", "-jar", "app.jar"]
FROM maven:3.9.1-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17
COPY --from=build /app/target/be-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9999
ENTRYPOINT ["java", "-jar", "app.jar"]
