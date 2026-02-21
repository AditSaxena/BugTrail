package com.bugtrail.bugtrailbackend.kafka;

import com.bugtrail.bugtrailbackend.domain.ActivityFeed;
import com.bugtrail.bugtrailbackend.repo.ActivityFeedRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class ActivityEventConsumer {

    private final ActivityFeedRepository repo;

    public ActivityEventConsumer(ActivityFeedRepository repo) {
        this.repo = repo;
    }

    @KafkaListener(topics = ActivityEventPublisher.TOPIC, containerFactory = "kafkaListenerContainerFactory")
    public void handle(ActivityEvent event) {
        ActivityFeed feed = new ActivityFeed(
                event.projectId(),
                event.ticketId(),
                ActivityFeed.Type.valueOf(event.type()),
                event.message()
        );
        repo.save(feed);
    }
}