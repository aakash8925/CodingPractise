package com.classroom.platform.service;

import com.classroom.platform.dto.GradeRequest;
import com.classroom.platform.dto.SubmissionRequest;
import com.classroom.platform.dto.SubmissionResponse;
import com.classroom.platform.dto.UserDto;
import com.classroom.platform.entity.*;
import com.classroom.platform.repository.SubmissionRepository;
import com.classroom.platform.repository.TaskRepository;
import com.classroom.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional
    public SubmissionResponse saveOrSubmit(SubmissionRequest request) {
        User student = getCurrentUser();
        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can submit tasks");
        }

        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        Optional<Submission> existing = submissionRepository.findByTaskIdAndStudentId(task.getId(), student.getId());
        Submission submission = existing.orElseGet(() -> Submission.builder()
                .student(student)
                .task(task)
                .build());

        if ((submission.getStatus() == SubmissionStatus.SUBMITTED || submission.getStatus() == SubmissionStatus.REVIEWED) && !request.isDraft()) {
             if (LocalDateTime.now().isAfter(task.getDeadline())) {
                 throw new RuntimeException("Deadline has passed. Cannot modify submissions.");
             }
        }

        submission.setHtmlCode(request.getHtmlCode());
        submission.setCssCode(request.getCssCode());
        submission.setJsCode(request.getJsCode());

        if (request.isDraft()) {
            submission.setStatus(SubmissionStatus.DRAFT);
        } else {
            if (LocalDateTime.now().isAfter(task.getDeadline())) {
                submission.setStatus(SubmissionStatus.LATE);
            } else {
                submission.setStatus(SubmissionStatus.SUBMITTED);
            }
            submission.setSubmittedAt(LocalDateTime.now());
        }

        Submission saved = submissionRepository.save(submission);
        return mapToResponse(saved);
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeRequest request) {
        User teacher = getCurrentUser();

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!submission.getTask().getClassroom().getTeacher().getId().equals(teacher.getId()) && teacher.getRole() != Role.ADMIN) {
            throw new RuntimeException("You are not authorized to grade this submission");
        }

        submission.setMarks(request.getMarks());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.REVIEWED);

        Submission updated = submissionRepository.save(submission);
        return mapToResponse(updated);
    }

    public SubmissionResponse getMySubmissionForTask(Long taskId) {
        User student = getCurrentUser();
        Submission submission = submissionRepository.findByTaskIdAndStudentId(taskId, student.getId())
                .orElseThrow(() -> new RuntimeException("No submission found for this task"));
        return mapToResponse(submission);
    }

    public List<SubmissionResponse> getSubmissionsForTask(Long taskId) {
        return submissionRepository.findByTaskId(taskId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public SubmissionResponse getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        return mapToResponse(submission);
    }

    public List<SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponse mapToResponse(Submission s) {
        return SubmissionResponse.builder()
                .id(s.getId())
                .taskId(s.getTask().getId())
                .taskTitle(s.getTask().getTitle())
                .htmlCode(s.getHtmlCode())
                .cssCode(s.getCssCode())
                .jsCode(s.getJsCode())
                .status(s.getStatus())
                .marks(s.getMarks())
                .feedback(s.getFeedback())
                .submittedAt(s.getSubmittedAt())
                .updatedAt(s.getUpdatedAt())
                .student(UserDto.builder()
                        .id(s.getStudent().getId())
                        .name(s.getStudent().getName())
                        .email(s.getStudent().getEmail())
                        .role(s.getStudent().getRole())
                        .active(s.getStudent().isActive())
                        .build())
                .build();
    }
}
