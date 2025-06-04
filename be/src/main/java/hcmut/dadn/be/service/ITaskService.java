package hcmut.dadn.be.service;

import hcmut.dadn.be.dto.request.TaskDTO;
import hcmut.dadn.be.dto.response.TaskResponse;
import hcmut.dadn.be.exception.DataNotFoundException;
import hcmut.dadn.be.models.task.TaskStatus;

import java.util.List;

public interface ITaskService {
    List<TaskResponse> getTaskOfCurrentUser();
    TaskResponse addTask(TaskDTO dto) throws DataNotFoundException;
    TaskResponse changeStatus(Long taskId, String status) throws DataNotFoundException;
    List<TaskResponse> getTaskByGardenAndStatus(Long gardenId, TaskStatus status) throws DataNotFoundException;
    TaskResponse getLatestTaskByGardenIdAndStatus(Long gardenId, TaskStatus status) throws DataNotFoundException;
}
