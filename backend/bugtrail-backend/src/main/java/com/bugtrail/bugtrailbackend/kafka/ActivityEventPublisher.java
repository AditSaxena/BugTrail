package com.bugtrail.bugtrailbackend.kafka;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ActivityEventPublisher {
    private static final Logger log = LoggerFactory.getLogger(ActivityEventPublisher.class);
    public static final String TOPIC = "bugtrail.activity.v1";

    private final KafkaTemplate<String, ActivityEvent> kafkaTemplate;

    public ActivityEventPublisher(KafkaTemplate<String, ActivityEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(Long projectId, Long ticketId, String type, String message) {
    ActivityEvent evt = new ActivityEvent(
            projectId,
            ticketId,
            type,
            message,
            Instant.now().toString()
    );

    try {
        kafkaTemplate.send(TOPIC, ticketId == null ? null : ticketId.toString(), evt)
                .whenComplete((res, ex) -> {
                    if (ex != null) {
                        log.error("Kafka publish failed (non-fatal): {}", ex.getMessage(), ex);
                    }
                });
    } catch (Exception e) {
        log.error("Kafka publish failed (non-fatal): {}", e.getMessage(), e);
    }
}
}