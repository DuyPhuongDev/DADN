package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.dto.request.NotificationRequest;
import hcmut.dadn.be.models.notification.Notification;
import hcmut.dadn.be.models.User;
import hcmut.dadn.be.repository.NotificationRepository;
import hcmut.dadn.be.repository.UserDeviceTokenRepository;
import hcmut.dadn.be.service.IExpoNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExpoNotificationService implements IExpoNotificationService {

    private static final String EXPO_API_URL = "https://exp.host/--/api/v2/push/send";
    private final UserDeviceTokenRepository userDeviceTokenRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void sendNotification(String expoPushToken, String title, String body) {
        if (!expoPushToken.startsWith("ExponentPushToken")) {
            throw new IllegalArgumentException("❌ Token không hợp lệ!");
        }

        // Dữ liệu gửi đi
        Map<String, Object> payload = Map.of(
                "to", expoPushToken,
                "title", title,
                "body", body
        );

        // Tạo request
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        // Gửi request đến Expo API
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(EXPO_API_URL, HttpMethod.POST, request, String.class);

        // Log kết quả
        if (response.getStatusCode() == HttpStatus.OK) {
            System.out.println("✅ Notification sent successfully: " + response.getBody());
        } else {
            System.err.println("❌ Failed to send notification: " + response.getBody());
        }
    }

    @Override
    public void saveNotification(NotificationRequest request) {
        // find user by user device token
        User user = userDeviceTokenRepository.findByDeviceToken(request.getDeviceToken()).getUser();
        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getBody())
                .build();
        notificationRepository.save(notification);
    }
}

