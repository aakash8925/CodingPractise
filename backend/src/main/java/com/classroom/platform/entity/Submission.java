package com.classroom.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "submissions",
    indexes = {
        @Index(name = "idx_submission_task", columnList = "task_id"),
        @Index(name = "idx_submission_student", columnList = "student_id"),
        @Index(name = "idx_submission_status", columnList = "status")
    },
    uniqueConstraints = {
        // One submission per student per task — enforced at DB level
        @UniqueConstraint(name = "uq_submission_task_student", columnNames = {"task_id", "student_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "html_code", columnDefinition = "TEXT")
    private String htmlCode;

    @Column(name = "css_code", columnDefinition = "TEXT")
    private String cssCode;

    @Column(name = "js_code", columnDefinition = "TEXT")
    private String jsCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.NOT_STARTED;

    private Integer marks;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
