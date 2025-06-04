package hcmut.dadn.be.controller;


import hcmut.dadn.be.dto.request.TaskDTO;
import hcmut.dadn.be.dto.response.TaskResponse;
import hcmut.dadn.be.models.task.TaskStatus;
import hcmut.dadn.be.service.ITaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/tasks")
public class TaskController {
    private final ITaskService taskService;

    @GetMapping
    public List<TaskResponse> getAllTasks() {
        return taskService.getTaskOfCurrentUser();
    }

    @PostMapping("/create")
    public TaskResponse createTask(@RequestBody TaskDTO dto) {
        return taskService.addTask(dto);
    }

    @PutMapping("/{id}")
    public TaskResponse changeStatus(@PathVariable Long id, @RequestBody Map<String, String> status) {
        return taskService.changeStatus(id, status.get("status"));
    }

    @GetMapping("/{gardenId}/completed")
    public List<TaskResponse> getCompletedTasks(@PathVariable Long gardenId) {
        return taskService.getTaskByGardenAndStatus(gardenId, TaskStatus.COMPLETED);
    }
}
