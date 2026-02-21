package com.bugtrail.bugtrailbackend.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class ActivityEventPublisher {

    public static final String TOPIC = "bugtrail.activity.v1";

    private final KafkaTemplate<String, ActivityEvent> kafkaTemplate;

    public ActivityEventPublisher(KafkaTemplate<String, ActivityEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(Long projectId, Long ticketId, String type, String message) {
        ActivityEvent event = new ActivityEvent(
                projectId,
                ticketId,
                type,
                message,
                Instant.now().toString()
        );
        kafkaTemplate.send(TOPIC, ticketId.toString(), event);
    }
}