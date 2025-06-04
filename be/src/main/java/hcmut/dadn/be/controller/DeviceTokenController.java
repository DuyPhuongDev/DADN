package hcmut.dadn.be.controller;

import hcmut.dadn.be.dto.request.DeviceTokenDTO;
import hcmut.dadn.be.dto.response.ApiResponse;
import hcmut.dadn.be.dto.response.DeviceTokenResponse;
import hcmut.dadn.be.service.IUserDeviceTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/device-tokens")
@RequiredArgsConstructor
public class DeviceTokenController {
    private final IUserDeviceTokenService userDeviceTokenService;

    @PostMapping("/token")
    public DeviceTokenResponse saveDeviceToken(@RequestBody DeviceTokenDTO request) {
        return userDeviceTokenService.addNewToken(request);
    }

    @GetMapping
    public Map<String, Object> getAllDeviceTokens() {
        return userDeviceTokenService.getAllTokensOfUser();
    }
}
