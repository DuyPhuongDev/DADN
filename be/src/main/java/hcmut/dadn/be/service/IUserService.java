package hcmut.dadn.be.service;


import hcmut.dadn.be.dto.request.RefreshTokenDTO;
import hcmut.dadn.be.dto.request.UserDTO;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.exception.InvalidParamException;
import hcmut.dadn.be.models.User;

import java.util.Map;

public interface IUserService {
    User create(UserDTO userDTO) throws DataNotFoundException;
    Map<String, String> login(String usernameOrEmail, String password) throws DataNotFoundException;
    User getLoggedUser() throws DataNotFoundException;
    Map<String, String> refreshToken(RefreshTokenDTO refreshTokenDTO) throws InvalidParamException;
}
