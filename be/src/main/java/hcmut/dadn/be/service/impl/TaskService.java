package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.dto.request.TaskDTO;
import hcmut.dadn.be.dto.response.TaskResponse;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.models.garden.Garden;
import hcmut.dadn.be.models.task.Task;
import hcmut.dadn.be.models.task.TaskStatus;
import hcmut.dadn.be.models.task.TaskType;
import hcmut.dadn.be.repository.GardenRepository;
import hcmut.dadn.be.repository.TaskRepository;
import hcmut.dadn.be.service.ITaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskService implements ITaskService {
    private final TaskRepository taskRepository;
    private final GardenRepository gardenRepository;
    private final UserService userService;

    @Override
    public List<TaskResponse> getTaskOfCurrentUser() {
        return taskRepository.findAllByCreatorId(userService.getLoggedUser().getId()).stream()
                .map(TaskResponse::from).toList();
    }

    @Override
    public TaskResponse addTask(TaskDTO dto) throws DataNotFoundException {
        Garden garden = gardenRepository.findById(dto.getGardenId()).orElseThrow(() -> new DataNotFoundException("Garden not found"));
        Task task = Task.builder()
                .description(dto.getDescription())
                .status(TaskStatus.valueOf(dto.getStatus()))
                .type(TaskType.valueOf(dto.getType()))
                .dueDate(dto.getDueDate())
                .garden(garden)
                .creator(userService.getLoggedUser())
                .build();
        return TaskResponse.from(taskRepository.save(task));
    }

    @Override
    public TaskResponse changeStatus(Long taskId, String status) throws DataNotFoundException {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new DataNotFoundException("Task not found"));
        task.setStatus(TaskStatus.valueOf(status));
        return TaskResponse.from(taskRepository.save(task));
    }

    @Override
    public List<TaskResponse> getTaskByGardenAndStatus(Long gardenId, TaskStatus status) throws DataNotFoundException {
        Garden garden = gardenRepository.findById(gardenId).orElseThrow(() -> new DataNotFoundException("Garden not found"));
        return taskRepository.findAllByGardenIdAndStatus(garden.getId(), status).stream()
                .map(TaskResponse::from).toList();
    }

    @Override
    public TaskResponse getLatestTaskByGardenIdAndStatus(Long gardenId, TaskStatus status) throws DataNotFoundException {
        Garden garden = gardenRepository.findById(gardenId).orElseThrow(() -> new DataNotFoundException("Garden not found"));
        Task task = taskRepository.findFirstByGardenIdAndStatusOrderByUpdatedAtDesc(garden.getId(), status);
        return TaskResponse.from(task);
    }
}
