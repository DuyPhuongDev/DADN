package hcmut.dadn.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GardenDTO {
    private String name;
    private String cropName;
    private String cropStage;
    private String description;
    private String thumbnail;
    private String location;
    private String city;
    private String district;
    private String ward;
    private String groupName;
    private String gardenType;
}
