package hcmut.dadn.be.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import hcmut.dadn.be.models.data.PumpAction;

import hcmut.dadn.be.models.data.PumpHistory;
import lombok.*;

import java.time.LocalDateTime;
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class PumpHistoryResponse {
    private Long pumpId;
    private Long deviceId;
    private PumpAction action;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime pumpAt;

//    public static PumpHistoryResponse fromPumpHistory(PumpHistory pumpHistory) {
//        PumpHistoryResponse response = new PumpHistoryResponse();
//        response.setPumpId(pumpHistory.getPumpId());
//        response.setDeviceId(pumpHistory.getDevice().getDeviceId());
//        response.setAction(pumpHistory.getAction());
//        response.setPumpAt(pumpHistory.getTimestamp());
//        return response;
//    }
}
