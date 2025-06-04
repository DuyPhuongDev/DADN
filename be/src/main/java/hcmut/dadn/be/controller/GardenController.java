package hcmut.dadn.be.controller;

import hcmut.dadn.be.dto.request.GardenDTO;
import hcmut.dadn.be.dto.response.GardenResponse;
import hcmut.dadn.be.service.IGardenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("${api.prefix}/gardens")
@RequiredArgsConstructor
public class GardenController {
    private final IGardenService gardenService;

    @GetMapping
    public List<GardenResponse> getAllGardens() {
        return gardenService.getGardenOfCurrentUser();
    }

    @PostMapping("/create")
    public GardenResponse createGarden(@RequestBody GardenDTO dto) {
        return gardenService.addGarden(dto);
    }

    @GetMapping("/{id}")
    public GardenResponse getGardenById(@PathVariable Long id) {
        return gardenService.getGardenById(id);
    }
    
}
