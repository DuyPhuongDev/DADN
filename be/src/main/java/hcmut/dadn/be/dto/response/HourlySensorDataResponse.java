package hcmut.dadn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class HourlySensorDataResponse {
    private Float value; // Giá trị trung bình của sensor (temperature, moisture, hoặc lux)
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp; // Đại diện cho giờ của dữ liệu (ví dụ: 2023-05-20 09:00:00)
} 