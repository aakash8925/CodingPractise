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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    @Transactional
    public SubmissionResponse saveOrSubmit(SubmissionRequest request) {
        User student = getCurrentUser();
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can submit tasks");
        }

        // Use JOIN FETCH query — avoids extra DB hits for task.classroom and task.createdBy
        Task task = taskRepository.findByIdWithDetails(request.getTaskId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Optional<Submission> existing = submissionRepository.findByTaskIdAndStudentId(task.getId(), student.getId());
        Submission submission = existing.orElseGet(() -> Submission.builder()
                .student(student)
                .task(task)
                .build());

        // Block editing a reviewed/submitted submission after deadline (unless it's a draft save)
        if (!request.isDraft() &&
            (submission.getStatus() == SubmissionStatus.SUBMITTED || submission.getStatus() == SubmissionStatus.REVIEWED) &&
            LocalDateTime.now().isAfter(task.getDeadline())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Deadline has passed. Cannot modify submission.");
        }

        submission.setHtmlCode(request.getHtmlCode());
        submission.setCssCode(request.getCssCode());
        submission.setJsCode(request.getJsCode());

        if (request.isDraft()) {
            submission.setStatus(SubmissionStatus.DRAFT);
        } else {
            submission.setStatus(LocalDateTime.now().isAfter(task.getDeadline())
                    ? SubmissionStatus.LATE
                    : SubmissionStatus.SUBMITTED);
            submission.setSubmittedAt(LocalDateTime.now());
        }

        Submission saved = submissionRepository.save(submission);
        return mapToResponse(saved);
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeRequest request) {
        User teacher = getCurrentUser();

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));

        // Authorization check: must be the classroom's teacher or an admin
        boolean isClassroomTeacher = submission.getTask().getClassroom().getTeacher().getId().equals(teacher.getId());
        if (!isClassroomTeacher && teacher.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to grade this submission");
        }

        submission.setMarks(request.getMarks());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.REVIEWED);

        Submission updated = submissionRepository.save(submission);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getMySubmissionForTask(Long taskId) {
        User student = getCurrentUser();
        Submission submission = submissionRepository.findByTaskIdAndStudentId(taskId, student.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No submission found for this task"));
        return mapToResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForTask(Long taskId) {
        // Single optimized JOIN FETCH query instead of N+1
        return submissionRepository.findByTaskId(taskId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
        return mapToResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getAllSubmissions() {
        // Single optimized JOIN FETCH query — avoids unbounded N+1 on all submissions
        return submissionRepository.findAllWithDetails().stream()
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
