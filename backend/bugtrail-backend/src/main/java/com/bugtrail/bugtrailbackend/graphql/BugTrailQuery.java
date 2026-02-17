package com.bugtrail.bugtrailbackend.graphql;

import com.bugtrail.bugtrailbackend.repo.ProjectRepository;
import com.bugtrail.bugtrailbackend.repo.TicketRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class BugTrailQuery {

    private final ProjectRepository projectRepo;
    private final TicketRepository ticketRepo;

    public BugTrailQuery(ProjectRepository projectRepo, TicketRepository ticketRepo) {
        this.projectRepo = projectRepo;
        this.ticketRepo = ticketRepo;
    }

    @QueryMapping
    public List<ProjectGql> projects() {
        return projectRepo.findAll().stream()
                .map(p -> new ProjectGql(p.getId(), p.getName(), p.getCreatedAt().toString()))
                .toList();
    }

    @QueryMapping
    public List<TicketGql> tickets(@Argument Long projectId) {
        return ticketRepo.findByProjectIdOrderByUpdatedAtDesc(projectId).stream()
                .map(t -> new TicketGql(
                        t.getId(),
                        t.getProject().getId(),
                        t.getTitle(),
                        t.getDescription(),
                        t.getStatus().name(),
                        t.getCreatedAt().toString(),
                        t.getUpdatedAt().toString()
                ))
                .toList();
    }
}
