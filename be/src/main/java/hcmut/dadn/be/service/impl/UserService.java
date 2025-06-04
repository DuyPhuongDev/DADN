package hcmut.dadn.be.service.impl;


import hcmut.dadn.be.dto.request.RefreshTokenDTO;
import hcmut.dadn.be.dto.request.UserDTO;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.exception.InvalidParamException;
import hcmut.dadn.be.models.User;
import hcmut.dadn.be.repository.UserRepository;
import hcmut.dadn.be.service.IUserService;
import hcmut.dadn.be.util.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }


    @Override
    public User create(UserDTO userDTO) throws DataNotFoundException {
        if(userRepository.existsByEmail(userDTO.getEmail())) {
            throw new DataIntegrityViolationException("Email already exists");
        }
        //convert from userDTO => user
        User newUser = User.builder()
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .profilePicture("https://firebasestorage.googleapis.com/v0/b/test-cloudstore-db240.appspot.com/o/avt.png?alt=media&token=5f8b5978-7431-4918-976b-f6c534f32dc4")
                .deviceTokens(new ArrayList<>())
                .notifications(new ArrayList<>())
                .gardens(new ArrayList<>())
                .tasks(new ArrayList<>())
                .build();
        return userRepository.save(newUser);
    }

    @Override
    public Map<String, String> login(String email, String password) throws DataNotFoundException {
        User existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new DataNotFoundException(
                        "User not found with username or email: " + email)
                );
        //Không nên truyền authorities trước khi authenticate() vì Spring security tự động bỏ qua và
        //sẽ đuược lấy lại từ UserDetailsService sau khi xác thực
        UsernamePasswordAuthenticationToken authenticationToken
                = new UsernamePasswordAuthenticationToken(
                email, password
        );
        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateTokenPair(existingUser);
    }

    @Override
    public User getLoggedUser() throws DataNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new DataNotFoundException("User not found with username: " + authentication.getName()));
    }
    
    @Override
    public Map<String, String> refreshToken(RefreshTokenDTO refreshTokenDTO) throws InvalidParamException {
        String refreshToken = refreshTokenDTO.getRefreshToken();
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new InvalidParamException("Refresh token is required");
        }
        
        // Verify if it's a refresh token
        if (!jwtTokenUtil.isRefreshToken(refreshToken)) {
            throw new InvalidParamException("Invalid refresh token");
        }
        
        try {
            String username = jwtTokenUtil.extractUsername(refreshToken);
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new DataNotFoundException("User not found with email: " + username));
            
            if (!jwtTokenUtil.validateToken(refreshToken, user)) {
                throw new InvalidParamException("Invalid refresh token");
            }
            
            // Generate new token pair
            return jwtTokenUtil.generateTokenPair(user);
            
        } catch (Exception e) {
            throw new InvalidParamException("Invalid refresh token: " + e.getMessage());
        }
    }
}
