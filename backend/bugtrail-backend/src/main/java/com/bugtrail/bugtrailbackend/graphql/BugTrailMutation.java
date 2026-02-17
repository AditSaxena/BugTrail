package com.bugtrail.bugtrailbackend.graphql;

import com.bugtrail.bugtrailbackend.domain.Project;
import com.bugtrail.bugtrailbackend.domain.Ticket;
import com.bugtrail.bugtrailbackend.repo.ProjectRepository;
import com.bugtrail.bugtrailbackend.repo.TicketRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
public class BugTrailMutation {

    private final ProjectRepository projectRepo;
    private final TicketRepository ticketRepo;

    public BugTrailMutation(ProjectRepository projectRepo, TicketRepository ticketRepo) {
        this.projectRepo = projectRepo;
        this.ticketRepo = ticketRepo;
    }

    @MutationMapping
    public ProjectGql createProject(@Argument String name) {
        projectRepo.findByNameIgnoreCase(name).ifPresent(p -> {
            throw new IllegalArgumentException("Project name already exists: " + name);
        });

        Project saved = projectRepo.save(new Project(name));
        return new ProjectGql(saved.getId(), saved.getName(), saved.getCreatedAt().toString());
    }

    @MutationMapping
    @Transactional
    public TicketGql createTicket(@Argument Long projectId,
                                 @Argument String title,
                                 @Argument String description) {

        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + projectId));

        Ticket saved = ticketRepo.save(new Ticket(project, title, description));
        return new TicketGql(
                saved.getId(),
                project.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getStatus().name(),
                saved.getCreatedAt().toString(),
                saved.getUpdatedAt().toString()
        );
    }
}
