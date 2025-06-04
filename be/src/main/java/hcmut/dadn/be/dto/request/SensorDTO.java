package hcmut.dadn.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SensorDTO {
    private Long gardenId;
    private String name;
    private String icon;
    private String unit;
    private String feedName;
    private String type;
}
