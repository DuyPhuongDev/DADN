package hcmut.dadn.be.util;

import hcmut.dadn.be.models.device.Device;
import hcmut.dadn.be.repository.DeviceRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class DeviceCache {

    private final DeviceRepository deviceRepository;
    private final Map<String, Device> deviceMap = new ConcurrentHashMap<>();

    @Autowired
    public DeviceCache(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @PostConstruct
    public void loadDevices() {
        List<Device> devices = deviceRepository.findAll();
        for (Device device : devices) {
            String key = device.getGarden().getGroupName() + "." + device.getFeedName();
            deviceMap.put(key, device);
        }
        log.info("✅ Loaded {} devices into cache", deviceMap.size());
    }

    public Device getDevice(String groupName, String feedName) {
        return deviceMap.get(groupName + "." + feedName);
    }
}
