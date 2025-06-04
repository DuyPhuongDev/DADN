package hcmut.dadn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import hcmut.dadn.be.models.device.Device;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DeviceResponse {
    private Long id;
    private String name;
    private Long gardenId;
    private String gardenName;
    private String type;
    private String icon;
    private String unit;
    private String feedName;
    private String groupName;
    private String status;

    public static DeviceResponse fromDevice(Device device) {
        return DeviceResponse.builder()
                .id(device.getDeviceId())
                .name(device.getDeviceName())
                .gardenId(device.getGarden().getId())
                .gardenName(device.getGarden().getGardenName())
                .type(device.getDeviceType().name())
                .icon(device.getIcon())
                .unit(device.getUnit())
                .feedName(device.getFeedName())
                .groupName(device.getGarden().getGroupName())
                .status(device.getPumpStatus()==null?null:device.getPumpStatus().name())
                .build();
    }
}
