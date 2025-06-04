package hcmut.dadn.be.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PumpDTO {
    private Long gardenId;
    private String name;
    private String icon;
    private String feedName;
    private String type;
    private String status;
}
