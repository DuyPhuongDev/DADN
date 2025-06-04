package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.task.Task;
import hcmut.dadn.be.models.task.TaskStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findAllByCreatorId(Long creatorId);

    List<Task> findAllByGardenIdAndStatus(Long creatorId, TaskStatus status);

    Task findFirstByGardenIdAndStatusOrderByUpdatedAtDesc(Long gardenId, TaskStatus status);

    Integer countByCreatorIdAndStatus(Long creatorId, TaskStatus status);
}
