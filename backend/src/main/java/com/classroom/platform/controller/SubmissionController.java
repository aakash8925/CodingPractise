package com.classroom.platform.controller;

import com.classroom.platform.dto.GradeRequest;
import com.classroom.platform.dto.SubmissionRequest;
import com.classroom.platform.dto.SubmissionResponse;
import com.classroom.platform.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(@Valid @RequestBody SubmissionRequest request) {
        return ResponseEntity.ok(submissionService.saveOrSubmit(request));
    }

    @GetMapping("/task/{taskId}/my")
    public ResponseEntity<SubmissionResponse> getMySubmission(@PathVariable Long taskId) {
        return ResponseEntity.ok(submissionService.getMySubmissionForTask(taskId));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForTask(taskId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }

    @PostMapping("/{id}/grade")
    public ResponseEntity<SubmissionResponse> grade(@PathVariable Long id, @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SubmissionResponse>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }
}
