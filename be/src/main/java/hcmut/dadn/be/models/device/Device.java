package hcmut.dadn.be.models.device;

import hcmut.dadn.be.models.garden.Garden;
import hcmut.dadn.be.models.data.PumpStatus;
import hcmut.dadn.be.models.data.SensorData;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "devices")
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deviceId;

    @Column(nullable = false, length = 100)
    private String deviceName;

    @Enumerated(EnumType.STRING)
    private DeviceType deviceType;

    private String icon;
    private String unit;

    @Enumerated(EnumType.STRING)
    private PumpStatus pumpStatus;

    @Column(nullable = false)
    private String feedName;

    @Column( updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "garden_id")
    private Garden garden;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SensorData> sensorsData;
}