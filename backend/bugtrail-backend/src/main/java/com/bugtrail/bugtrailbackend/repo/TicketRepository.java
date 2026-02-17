package com.bugtrail.bugtrailbackend.repo;

import com.bugtrail.bugtrailbackend.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByProjectIdOrderByUpdatedAtDesc(Long projectId);
}
