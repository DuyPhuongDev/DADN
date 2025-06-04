package hcmut.dadn.be.controller;

import hcmut.dadn.be.dto.request.PumpDTO;
import hcmut.dadn.be.dto.request.SensorDTO;
import hcmut.dadn.be.dto.response.DeviceResponse;
import hcmut.dadn.be.dto.response.HourlySensorDataResponse;
import hcmut.dadn.be.service.IDeviceService;
import hcmut.dadn.be.service.impl.SensorDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("${api.prefix}/devices")
public class DeviceController {
    private final IDeviceService deviceService;
    private final SensorDataService sensorDataService;

    @GetMapping("/sensors")
    public List<DeviceResponse> getAllSensors() {
        return deviceService.getSensorByCurrentUser();
    }

    @GetMapping("/{gardenId}/pumps")
    public List<DeviceResponse> getAllPumps(@PathVariable Long gardenId) {
        return deviceService.getPumpByCurrentUser(gardenId);
    }

    @PostMapping("/sensor")
    public DeviceResponse createSensor(@RequestBody SensorDTO dto){
        return deviceService.createSensor(dto);
    }
    @PostMapping("/pump")
    public DeviceResponse createPump(@RequestBody PumpDTO dto){
        return deviceService.createPump(dto);
    }

    @GetMapping("/{id}/sensor-data")
    public List<HourlySensorDataResponse> getSensorData(@PathVariable Long id) {
        return sensorDataService.getHourlyAverage(id);
    }
}
