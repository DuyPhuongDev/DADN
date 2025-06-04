package hcmut.dadn.be.controller;

import hcmut.dadn.be.dto.request.RefreshTokenDTO;
import hcmut.dadn.be.dto.request.UserDTO;
import hcmut.dadn.be.dto.request.UserLoginDTO;
import hcmut.dadn.be.exception.InvalidParamException;
import hcmut.dadn.be.models.User;
import hcmut.dadn.be.dto.response.UserProfileResponse;
import hcmut.dadn.be.models.task.TaskStatus;
import hcmut.dadn.be.repository.DeviceRepository;
import hcmut.dadn.be.repository.TaskRepository;
import hcmut.dadn.be.service.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("${api.prefix}/auth")
@RequiredArgsConstructor
@RestController
public class UserController {
    private final IUserService userService;
    private final DeviceRepository deviceRepository;
    private final TaskRepository taskRepository;

    @PostMapping("/register")
    public UserProfileResponse create(@Valid @RequestBody UserDTO userDTO
            , BindingResult result) {
            if(result.hasErrors()){
                List<String> errorMessages = result.getFieldErrors()
                        .stream()
                        .map(FieldError::getDefaultMessage)
                        .toList();
                throw new InvalidParamException(errorMessages.toString());
            }
            return UserProfileResponse.fromUser(userService.create(userDTO));
    }

    @PostMapping("/login")
    public Map<String, String> login(@Valid @RequestBody UserLoginDTO userLoginDTO){
            return userService.login(userLoginDTO.getEmail(), userLoginDTO.getPassword());
    }
    
    @PostMapping("/refresh-token")
    public Map<String, String> refreshToken(@RequestBody RefreshTokenDTO refreshTokenDTO) {
        return userService.refreshToken(refreshTokenDTO);
    }

    @GetMapping("/me")
    public UserProfileResponse getProfile() {
        User user = userService.getLoggedUser();
        UserProfileResponse userProfileResponse = UserProfileResponse.fromUser(user);
        userProfileResponse.setSensors(deviceRepository.countAllByUserId(user.getId()));
        userProfileResponse.setCompletedTask(taskRepository.countByCreatorIdAndStatus(user.getId(), TaskStatus.COMPLETED));
        return userProfileResponse;
    }
}
