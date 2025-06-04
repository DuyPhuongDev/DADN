package hcmut.dadn.be.dto.response;

import hcmut.dadn.be.models.notification.UserDeviceToken;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeviceTokenResponse {
    private String token;
    private Long userId;

    public static DeviceTokenResponse fromToken(UserDeviceToken userDeviceToken) {
        return DeviceTokenResponse.builder().token(userDeviceToken.getDeviceToken())
                .userId(userDeviceToken.getUser().getId())
                .build();
    }
}
