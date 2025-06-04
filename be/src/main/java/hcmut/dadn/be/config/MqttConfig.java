package hcmut.dadn.be.config;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MqttConfig {

    @Value("${AIO_USERNAME}")
    private String ADAFRUIT_IO_USERNAME;

    @Value("${AIO_KEY}")
    private String ADAFRUIT_IO_KEY;

    @Value("${MQTT_BROKER}")
    private String MQTT_BROKER;

    @Value("${CLIENT_ID}")
    private String CLIENT_ID;

    @Bean
    public MqttClient mqttClient() throws Exception {
        MqttClient client = new MqttClient(MQTT_BROKER, CLIENT_ID, new MemoryPersistence());

        MqttConnectOptions options = new MqttConnectOptions();
        options.setUserName(ADAFRUIT_IO_USERNAME);
        options.setPassword(ADAFRUIT_IO_KEY.toCharArray());
        options.setCleanSession(true);

        client.connect(options);
        return client;
    }
}