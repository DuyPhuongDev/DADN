package hcmut.dadn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import hcmut.dadn.be.models.User;
import lombok.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class UserProfileResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profilePicture;
    private String address;
    private String dateOfBirth;
    private Long roleId;
    private String roleName;
    private List<Map<String, Object>> gardens;
    private Integer sensors;
    private Integer completedTask;
    
    public static UserProfileResponse fromUser(User user) {
        List<Map<String, Object>> gardens = user.getGardens().stream().map(garden -> {
            Map<String, Object> gardenMap = new HashMap<>();
            gardenMap.put("id", garden.getId());
            gardenMap.put("groupName", garden.getGroupName());
            return gardenMap;
        }).toList();
        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .address(user.getAddress())
                .dateOfBirth(user.getDateOfBirth().toString())
                .phoneNumber(user.getPhoneNumber())
                .profilePicture(user.getProfilePicture())
                .gardens(gardens)
                .roleId(1L)
                .roleName("GARDENER")
                .build();
    }
} 