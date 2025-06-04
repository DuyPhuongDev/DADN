package hcmut.dadn.be.models.garden;

import hcmut.dadn.be.models.User;
import hcmut.dadn.be.models.device.Device;
import hcmut.dadn.be.models.task.Task;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "gardens")
@Entity
public class Garden {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gardenName;
    private String description;
    private String location;
    private String city;
    private String district;
    private String ward;
    private String cropName;
    private String cropStage;
    private String thumbnail;
    private String groupName;

    @Enumerated(EnumType.STRING)
    private GardenType gardenType;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "garden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Device> devices;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "garden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;
}
