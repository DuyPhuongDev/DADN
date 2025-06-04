package hcmut.dadn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import hcmut.dadn.be.models.task.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskResponse {
    private Long id;
    private String description;
    private String status;
    private String type;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    private String updateAt;
    private Long gardenId;
    private String gardenName;

    public static TaskResponse from(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .type(task.getType().name())
                .dueDate(task.getDueDate())
                .gardenId(task.getGarden().getId())
                .updateAt(task.getUpdatedAt().toString())
                .gardenName(task.getGarden().getGardenName())
                .build();
    }
}
