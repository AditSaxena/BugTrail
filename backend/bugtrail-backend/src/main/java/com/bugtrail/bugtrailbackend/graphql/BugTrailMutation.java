package com.bugtrail.bugtrailbackend.graphql;

import com.bugtrail.bugtrailbackend.domain.Comment;
import com.bugtrail.bugtrailbackend.domain.Project;
import com.bugtrail.bugtrailbackend.domain.Ticket;
import com.bugtrail.bugtrailbackend.domain.User;
import com.bugtrail.bugtrailbackend.repo.CommentRepository;
import com.bugtrail.bugtrailbackend.repo.ProjectRepository;
import com.bugtrail.bugtrailbackend.repo.TicketRepository;
import com.bugtrail.bugtrailbackend.repo.UserRepository;
import com.bugtrail.bugtrailbackend.kafka.ActivityEventPublisher;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

@Controller
public class BugTrailMutation {

    private final ProjectRepository projectRepo;
    private final TicketRepository ticketRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final ActivityEventPublisher publisher;

    public BugTrailMutation(ProjectRepository projectRepo,
                            TicketRepository ticketRepo,
                            UserRepository userRepo,
                            CommentRepository commentRepo,
                            ActivityEventPublisher publisher) {
        this.projectRepo = projectRepo;
        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;
        this.commentRepo = commentRepo;
        this.publisher = publisher;
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
        publisher.publish(project.getId(), saved.getId(), "TICKET_CREATED",
                "Ticket created: " + saved.getTitle());
        return toTicketGql(saved);
    }

    @MutationMapping
    public UserGql createUser(@Argument String name, @Argument String role) {
        userRepo.findByNameIgnoreCase(name).ifPresent(u -> {
            throw new IllegalArgumentException("User already exists: " + name);
        });

        User saved = userRepo.save(new User(name, User.Role.valueOf(role)));
        return new UserGql(saved.getId(), saved.getName(), saved.getRole().name());
    }

    @MutationMapping
    @Transactional
    public TicketGql assignTicket(@Argument Long ticketId, @Argument Long userId) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        ticket.setAssignee(user);
        publisher.publish(ticket.getProject().getId(), ticket.getId(), "ASSIGNED",
        "Assigned to: " + user.getName());
        return toTicketGql(ticket);
    }

    @MutationMapping
    @Transactional
    public TicketGql changeStatus(@Argument Long ticketId, @Argument String status) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        ticket.setStatus(Ticket.Status.valueOf(status));
        publisher.publish(ticket.getProject().getId(), ticket.getId(), "STATUS_CHANGED",
        "Status changed to: " + ticket.getStatus().name());
        return toTicketGql(ticket);
    }

    @MutationMapping
    @Transactional
    public CommentGql addComment(@Argument Long ticketId, @Argument Long authorId, @Argument String text) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

        User author = userRepo.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + authorId));

        Comment saved = commentRepo.save(new Comment(ticket, author, text));
        publisher.publish(ticket.getProject().getId(), ticket.getId(), "COMMENT_ADDED",
        "Comment added by " + author.getName());
        return new CommentGql(
                saved.getId(),
                ticket.getId(),
                new UserGql(author.getId(), author.getName(), author.getRole().name()),
                saved.getText(),
                saved.getCreatedAt().toString()
        );
    }

    private TicketGql toTicketGql(Ticket t) {
        return new TicketGql(
                t.getId(),
                t.getProject().getId(),
                t.getTitle(),
                t.getDescription(),
                t.getStatus().name(),
                t.getAssignee()== null ? null : new UserGql(
                        t.getAssignee().getId(),
                        t.getAssignee().getName(),
                        t.getAssignee().getRole().name()
                ),
                t.getCreatedAt().toString(),
                t.getUpdatedAt().toString()
        );
    }
}
