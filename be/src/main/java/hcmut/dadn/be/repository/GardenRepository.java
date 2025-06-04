package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.garden.Garden;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GardenRepository extends JpaRepository<Garden, Long> {
    List<Garden> findAllByUserId(Long userId);
}
