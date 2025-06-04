package hcmut.dadn.be.controller;

import hcmut.dadn.be.dto.request.NotificationRequest;
import hcmut.dadn.be.service.impl.ExpoNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private static final String EXPO_API_URL = "https://exp.host/--/api/v2/push/send";
    private final ExpoNotificationService expoNotificationService;

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        try {
            String expoPushToken = request.getDeviceToken();

            // Kiểm tra token có hợp lệ không
            if (!expoPushToken.startsWith("ExponentPushToken")) {
                return ResponseEntity.badRequest().body("❌ Token không hợp lệ!");
            }

            // Dữ liệu gửi đi
            Map<String, Object> payload = Map.of(
                    "to", expoPushToken,
                    "title", request.getTitle(),
                    "body", request.getBody()
            );

            // Tạo request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);

            // Gửi request đến Expo API
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.exchange(EXPO_API_URL, HttpMethod.POST, requestEntity, String.class);

            // Kiểm tra phản hồi từ Expo
            if (response.getStatusCode() == HttpStatus.OK) {
                expoNotificationService.saveNotification(request);
                return ResponseEntity.ok("✅ Notification sent successfully!");
            } else {
                return ResponseEntity.status(response.getStatusCode()).body("❌ Failed to send notification: " + response.getBody());
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Failed to send notification: " + e.getMessage());
        }
    }
}

