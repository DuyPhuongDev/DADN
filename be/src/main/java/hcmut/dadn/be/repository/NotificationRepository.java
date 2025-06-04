package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
}
