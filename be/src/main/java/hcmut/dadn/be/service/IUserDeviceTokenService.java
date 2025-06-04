package hcmut.dadn.be.service;

import hcmut.dadn.be.dto.request.DeviceTokenDTO;
import hcmut.dadn.be.exception.DataAlreadyExistsException;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.dto.response.DeviceTokenResponse;

import java.util.List;
import java.util.Map;

public interface IUserDeviceTokenService {
    DeviceTokenResponse addNewToken(DeviceTokenDTO request) throws DataNotFoundException, DataAlreadyExistsException;

    Map<String, Object> getAllTokensOfUser() throws DataNotFoundException;
}
