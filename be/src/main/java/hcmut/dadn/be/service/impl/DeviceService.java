package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.dto.request.PumpDTO;
import hcmut.dadn.be.dto.request.SensorDTO;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.dto.response.DeviceResponse;
import hcmut.dadn.be.models.data.PumpStatus;
import hcmut.dadn.be.models.device.Device;
import hcmut.dadn.be.models.device.DeviceType;
import hcmut.dadn.be.repository.DeviceRepository;
import hcmut.dadn.be.repository.GardenRepository;
import hcmut.dadn.be.service.IDeviceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeviceService implements IDeviceService {
    private final DeviceRepository deviceRepository;
    private final UserService userService;
    private final GardenRepository gardenRepository;

    @Override
    public DeviceResponse createSensor(SensorDTO dto) throws DataNotFoundException {
        Device sensor = Device.builder()
                .deviceName(dto.getName())
                .deviceType(DeviceType.valueOf(dto.getType()))
                .icon(dto.getIcon())
                .unit(dto.getUnit())
                .garden(gardenRepository.findById(dto.getGardenId()).orElseThrow(() -> new DataNotFoundException("not found garden")))
                .feedName(dto.getFeedName())
                .sensorsData(new ArrayList<>())
                .build();
        return DeviceResponse.fromDevice(deviceRepository.save(sensor));
    }

    @Override
    public DeviceResponse createPump(PumpDTO dto) throws DataNotFoundException {
        Device pump = Device.builder()
                .deviceName(dto.getName())
                .deviceType(DeviceType.valueOf(dto.getType()))
                .icon(dto.getIcon())
                .pumpStatus(PumpStatus.valueOf(dto.getStatus()))
                .garden(gardenRepository.findById(dto.getGardenId()).orElseThrow(() -> new DataNotFoundException("not found garden")))
                .feedName(dto.getFeedName())
                .sensorsData(new ArrayList<>())
                .build();
        return DeviceResponse.fromDevice(deviceRepository.save(pump));
    }

    @Override
    public List<DeviceResponse> getSensorByCurrentUser() throws DataNotFoundException {
        return deviceRepository.findAllByDeviceTypeNot(DeviceType.PUMP).stream().map(DeviceResponse::fromDevice).toList();
    }

    @Override
    public List<DeviceResponse> getPumpByCurrentUser(Long gardenId) throws DataNotFoundException {
        return deviceRepository.findAllByDeviceTypeAndGardenId(DeviceType.PUMP, gardenId).stream().map(DeviceResponse::fromDevice).toList();
    }

}
