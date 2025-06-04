package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.dto.request.DeviceTokenDTO;
import hcmut.dadn.be.exception.DataAlreadyExistsException;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.models.User;
import hcmut.dadn.be.models.notification.UserDeviceToken;
import hcmut.dadn.be.repository.UserDeviceTokenRepository;
import hcmut.dadn.be.repository.UserRepository;
import hcmut.dadn.be.dto.response.DeviceTokenResponse;
import hcmut.dadn.be.service.IUserDeviceTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserDeviceService implements IUserDeviceTokenService {
    private final UserRepository userRepository;
    private final UserDeviceTokenRepository deviceTokenRepository;
    private final UserService userService;

    @Override
    public DeviceTokenResponse addNewToken(DeviceTokenDTO request) throws DataNotFoundException, DataAlreadyExistsException {
        User user = userService.getLoggedUser();

        if(deviceTokenRepository.existsByUserAndDeviceToken(user, request.getDeviceToken())) throw new DataAlreadyExistsException("Device token already exists");

        UserDeviceToken deviceToken = new UserDeviceToken();
        deviceToken.setUser(user);
        deviceToken.setDeviceToken(request.getDeviceToken());
        if (user.getDeviceTokens()==null) user.setDeviceTokens(new ArrayList<>());
        user.getDeviceTokens().add(deviceToken);
        userRepository.save(user);
        return DeviceTokenResponse.fromToken(deviceToken);
    }

    @Override
    public Map<String, Object> getAllTokensOfUser() throws DataNotFoundException {
        List<UserDeviceToken> userDeviceTokens = deviceTokenRepository.findAllByUser(userService.getLoggedUser());
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userService.getLoggedUser().getId());
        List<String> deviceTokens = new ArrayList<>();
        for (UserDeviceToken deviceToken : userDeviceTokens) {
           deviceTokens.add(deviceToken.getDeviceToken());
        }
        result.put("deviceTokens", deviceTokens);
        return result;
    }
}
