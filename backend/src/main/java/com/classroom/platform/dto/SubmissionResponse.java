package com.classroom.platform.dto;

import com.classroom.platform.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long taskId;
    private String taskTitle;
    private UserDto student;
    private String htmlCode;
    private String cssCode;
    private String jsCode;
    private SubmissionStatus status;
    private Integer marks;
    private String feedback;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}
