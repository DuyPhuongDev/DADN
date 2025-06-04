package hcmut.dadn.be.service;

import hcmut.dadn.be.dto.request.NotificationRequest;

public interface IExpoNotificationService {
    void sendNotification(String expoPushToken, String title, String body);
    void saveNotification(NotificationRequest request);
}
