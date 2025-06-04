package hcmut.dadn.be.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TaskDTO {
    private String description;
    private String status;
    private String type;
    private LocalDate dueDate;
    private Long gardenId;
}
