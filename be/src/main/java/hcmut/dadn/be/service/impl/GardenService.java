package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.dto.request.GardenDTO;
import hcmut.dadn.be.dto.response.GardenResponse;
import hcmut.dadn.be.models.garden.Garden;
import hcmut.dadn.be.models.garden.GardenType;
import hcmut.dadn.be.models.task.TaskStatus;
import hcmut.dadn.be.models.task.Task;
import hcmut.dadn.be.repository.GardenRepository;
import hcmut.dadn.be.repository.TaskRepository;
import hcmut.dadn.be.service.IGardenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hcmut.dadn.be.exception.DataNotFoundException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GardenService implements IGardenService {
    private final GardenRepository gardenRepository;
    private final UserService userService;
    private final TaskRepository taskRepository;

    @Override
    public List<GardenResponse> getGardenOfCurrentUser() {
        return gardenRepository.findAllByUserId(userService.getLoggedUser().getId()).stream().map(g -> {
            Task latestTask = taskRepository.findFirstByGardenIdAndStatusOrderByUpdatedAtDesc(g.getId(), TaskStatus.COMPLETED);
            GardenResponse gardenResponse =  GardenResponse.fromGarden(g);
            if(latestTask!=null){
                String result = timeAgo(latestTask.getUpdatedAt());
                gardenResponse.setLastActivity(latestTask.getDescription() + result);
            }
            return gardenResponse;
        }).toList();
    }

    @Override
    public GardenResponse addGarden(GardenDTO dto) {
        Garden garden = Garden.builder()
                .gardenName(dto.getName())
                .cropName(dto.getCropName())
                .cropStage(dto.getCropStage())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .city(dto.getCity())
                .district(dto.getDistrict())
                .ward(dto.getWard())
                .thumbnail(dto.getThumbnail()!=null ? dto.getThumbnail() :"https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e")
                .groupName(dto.getGroupName())
                .gardenType(GardenType.valueOf(dto.getGardenType()))
                .tasks(new ArrayList<>())
                .devices(new ArrayList<>())
                .user(userService.getLoggedUser())
                .build();
        return GardenResponse.fromGarden(gardenRepository.save(garden));
    }

    @Override
    public GardenResponse getGardenById(Long id) {
        Garden garden = gardenRepository.findById(id).orElseThrow(() -> new DataNotFoundException("Garden not found"));
        Task latestTask = taskRepository.findFirstByGardenIdAndStatusOrderByUpdatedAtDesc(garden.getId(), TaskStatus.COMPLETED);
        GardenResponse gardenResponse =  GardenResponse.fromGarden(garden);
        if(latestTask!=null){
            String result = timeAgo(latestTask.getUpdatedAt());
            gardenResponse.setLastActivity(latestTask.getDescription() + result);
        }
        return gardenResponse;
    }

    public String timeAgo(LocalDateTime pastTime) {
        LocalDateTime now = LocalDateTime.now();
        Duration duration = Duration.between(pastTime, now);

        long minutes = duration.toMinutes();
        long hours = duration.toHours();
        long days = duration.toDays();

        if (minutes < 1) {
            return " (vừa xong)";
        } else if (minutes < 60) {
            return " (" + minutes + " phút trước)";
        } else if (hours < 24) {
            return " (" + hours + " giờ trước)";
        } else if (days < 7) {
            return " (" + days + " ngày trước)";
        } else if (days < 30) {
            long weeks = days / 7;
            return " (" + weeks + " tuần trước)";
        } else if (days < 365) {
            long months = days / 30;
            return " (" + months + " tháng trước)";
        } else {
            long years = days / 365;
            return " (" + years + " năm trước)";
        }
    }

}
