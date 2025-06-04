package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.data.SensorData;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    
    @Query("SELECT date_trunc('hour', s.recordAt) AS hour, AVG(s.value) " +
        "FROM SensorData s " +
        "WHERE s.recordAt >= :fromTime AND s.device.deviceId=:id " +
        "GROUP BY hour " +
        "ORDER BY hour")
    List<Object[]> findHourlyAverageById(LocalDateTime fromTime, Long id);
}
