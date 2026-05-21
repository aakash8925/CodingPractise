package com.classroom.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private Long classroomId;
    private String classroomName;
    private UserDto createdBy;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
}
