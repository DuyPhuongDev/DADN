package hcmut.dadn.be.util;

import hcmut.dadn.be.models.data.SensorData;
import hcmut.dadn.be.repository.SensorDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class SensorDataBatchSaver {

    private final SensorDataRepository sensorDataRepository;
    private final BlockingQueue<SensorData> queue = new LinkedBlockingQueue<>();
    private final int BATCH_SIZE = 10;

    @Autowired
    public SensorDataBatchSaver(SensorDataRepository sensorDataRepository) {
        this.sensorDataRepository = sensorDataRepository;

        // Start background thread
        new Thread(this::processQueue).start();
    }

    public void addSensorData(SensorData data) {
        queue.offer(data);
    }

    private void processQueue() {
        List<SensorData> batch = new ArrayList<>();

        while (true) {
            try {
                SensorData data = queue.poll(5, TimeUnit.SECONDS);
                if (data != null) {
                    batch.add(data);
                }

                if (batch.size() >= BATCH_SIZE || (data == null && !batch.isEmpty())) {
                    sensorDataRepository.saveAll(batch);
                    log.info("✅ Saved {} sensor records in batch", batch.size());
                    batch.clear();
                }
            } catch (Exception e) {
                log.error("❌ Error in SensorDataBatchSaver: ", e);
            }
        }
    }
}
