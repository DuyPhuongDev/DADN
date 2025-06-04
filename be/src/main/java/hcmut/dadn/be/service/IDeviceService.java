package hcmut.dadn.be.service;

import hcmut.dadn.be.dto.request.PumpDTO;
import hcmut.dadn.be.dto.request.SensorDTO;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.dto.response.DeviceResponse;
import hcmut.dadn.be.models.device.Device;
import org.eclipse.paho.client.mqttv3.MqttException;

import java.util.List;

public interface IDeviceService {
    DeviceResponse createSensor(SensorDTO dto) throws DataNotFoundException;

    DeviceResponse createPump(PumpDTO dto) throws DataNotFoundException;

    List<DeviceResponse> getSensorByCurrentUser() throws DataNotFoundException;
    List<DeviceResponse> getPumpByCurrentUser(Long gardenId) throws DataNotFoundException;

    //boolean activePump(Device device) throws DataNotFoundException;

}
