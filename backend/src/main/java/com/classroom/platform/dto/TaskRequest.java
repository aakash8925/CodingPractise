package com.classroom.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Classroom ID is required")
    private Long classroomId;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;
}
