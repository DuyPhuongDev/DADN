package hcmut.dadn.be.dto.response;

import hcmut.dadn.be.models.garden.Garden;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class GardenResponse {
    private Long id;
    private String name;
    private String cropName;
    private String cropStage;
    private String thumbnail;
    private String location;
    private String city;
    private String district;
    private String ward;
    private String groupName;
    private String gardenType;
    private List<Map<String, Object>> sensors;
    private String lastActivity;
    private String createAt;
    private String updateAt;

    public static GardenResponse fromGarden(Garden garden) {
        List<Map<String, Object>> sensors = garden.getDevices().stream().map(d -> {
            Map<String, Object> sensor = new HashMap<>();
            sensor.put("id", d.getDeviceId());
            sensor.put("type", d.getDeviceType().name());
            sensor.put("feedName", d.getFeedName());
            return sensor;
        }).toList();
        return GardenResponse.builder()
                .id(garden.getId())
                .name(garden.getGardenName())
                .cropName(garden.getCropName())
                .location(garden.getLocation())
                .city(garden.getCity())
                .district(garden.getDistrict())
                .ward(garden.getWard())
                .cropStage(garden.getCropStage())
                .thumbnail(garden.getThumbnail())
                .groupName(garden.getGroupName())
                .gardenType(garden.getGardenType().name())
                .sensors(sensors)
                .lastActivity("Không có hoạt động nào gần đây!")
                .createAt(garden.getCreatedAt().toString())
                .updateAt(garden.getUpdatedAt().toString())
                .build();
    }
}
