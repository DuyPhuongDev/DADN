package hcmut.dadn.be.models.data;

import hcmut.dadn.be.models.device.Device;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pump_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PumpHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "device_id", nullable = false)
    private Device device; // FK đến Device

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PumpAction action;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime recordAt;
}
