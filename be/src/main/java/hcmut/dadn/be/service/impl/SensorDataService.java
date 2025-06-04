package hcmut.dadn.be.service.impl;

import hcmut.dadn.be.repository.SensorDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import hcmut.dadn.be.dto.response.HourlySensorDataResponse;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorDataService {
    private final SensorDataRepository sensorDataRepository;

    public List<HourlySensorDataResponse> getHourlyAverage(Long id) {
        LocalDateTime fromTime = LocalDateTime.now().minusDays(1);
        List<Object[]> results = sensorDataRepository.findHourlyAverageById(fromTime, id);
        return results.stream()
                .map(result -> HourlySensorDataResponse.builder()
                        .timestamp((LocalDateTime) result[0])
                        .value(((Double) result[1]).floatValue())
                        .build()).toList();
    }

}
