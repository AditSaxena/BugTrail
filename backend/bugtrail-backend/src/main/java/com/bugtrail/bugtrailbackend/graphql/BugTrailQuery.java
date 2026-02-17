package com.bugtrail.bugtrailbackend.graphql;

import com.bugtrail.bugtrailbackend.repo.CommentRepository;
import com.bugtrail.bugtrailbackend.repo.ProjectRepository;
import com.bugtrail.bugtrailbackend.repo.TicketRepository;
import com.bugtrail.bugtrailbackend.repo.UserRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class BugTrailQuery {

    private final ProjectRepository projectRepo;
    private final TicketRepository ticketRepo;
    private final CommentRepository commentRepo;
    private final UserRepository userRepo;

    public BugTrailQuery(ProjectRepository projectRepo, 
                         TicketRepository ticketRepo,
                         CommentRepository commentRepo,
                         UserRepository userRepo) {
        this.projectRepo = projectRepo;
        this.ticketRepo = ticketRepo;
        this.commentRepo = commentRepo;
        this.userRepo = userRepo;
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
                        t.getAssignee() == null ? null : new UserGql(
                                t.getAssignee().getId(),
                                t.getAssignee().getName(),
                                t.getAssignee().getRole().name()
                        ),
                        t.getCreatedAt().toString(),
                        t.getUpdatedAt().toString()
                ))
                .toList();
    }


    @QueryMapping
    public List<UserGql> users() {
        return userRepo.findAll().stream()
                .map(u -> new UserGql(u.getId(), u.getName(), u.getRole().name()))
                .toList();
    }

    @QueryMapping
    public List<CommentGql> comments(@Argument Long ticketId) {
        return commentRepo.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
                .map(c -> new CommentGql(
                        c.getId(),
                        c.getTicket().getId(),
                        new UserGql(
                                c.getAuthor().getId(),
                                c.getAuthor().getName(),
                                c.getAuthor().getRole().name()
                        ),
                        c.getText(),
                        c.getCreatedAt().toString()
                ))
                .toList();
    }

}
