package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.User;
import hcmut.dadn.be.models.notification.UserDeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserDeviceTokenRepository extends JpaRepository<UserDeviceToken, Long> {
    List<UserDeviceToken> findAllByUser(User user);

    boolean existsByUserAndDeviceToken(User user, String deviceToken);

    UserDeviceToken findByDeviceToken(String token);
}
