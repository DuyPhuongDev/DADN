package hcmut.dadn.be.repository;

import hcmut.dadn.be.models.device.Device;
import hcmut.dadn.be.models.device.DeviceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findAllByDeviceTypeAndGardenId(DeviceType deviceType, Long gardenId);

    List<Device> findAllByDeviceTypeNot(DeviceType deviceType);

    @Query("SELECT d FROM Device d WHERE d.feedName = :feedName AND d.garden.groupName = :groupName")
    Device findByFeedNameAndGroupName(String feedName, String groupName);

    @Query("SELECT COUNT(d) FROM Device d WHERE d.garden.user.id =:userId")
    Integer countAllByUserId(Long userId);
}
