package com.classroom.platform.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionRequest {
    @NotNull(message = "Task ID is required")
    private Long taskId;

    private String htmlCode;
    private String cssCode;
    private String jsCode;

    private boolean draft;
}
