package hcmut.dadn.be.service;

import hcmut.dadn.be.dto.request.GardenDTO;
import hcmut.dadn.be.dto.response.GardenResponse;
import hcmut.dadn.be.exception.DataNotFoundException;


import java.util.List;

public interface IGardenService {
    List<GardenResponse> getGardenOfCurrentUser();

    GardenResponse addGarden(GardenDTO dto);

    GardenResponse getGardenById(Long id) throws DataNotFoundException;
}
