package com.bugtrail.bugtrailbackend.repo;

import com.bugtrail.bugtrailbackend.domain.ActivityFeed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityFeedRepository extends JpaRepository<ActivityFeed, Long> {
    List<ActivityFeed> findTop50ByProjectIdOrderByCreatedAtDesc(Long projectId);
}