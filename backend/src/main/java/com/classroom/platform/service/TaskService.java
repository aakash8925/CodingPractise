package com.classroom.platform.service;

import com.classroom.platform.dto.TaskRequest;
import com.classroom.platform.dto.TaskResponse;
import com.classroom.platform.dto.UserDto;
import com.classroom.platform.entity.Classroom;
import com.classroom.platform.entity.Role;
import com.classroom.platform.entity.Task;
import com.classroom.platform.entity.User;
import com.classroom.platform.repository.ClassroomRepository;
import com.classroom.platform.repository.TaskRepository;
import com.classroom.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        User user = getCurrentUser();
        if (user.getRole() != Role.TEACHER && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only teachers or admins can create tasks");
        }

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .classroom(classroom)
                .createdBy(user)
                .deadline(request.getDeadline())
                .build();

        Task saved = taskRepository.save(task);
        return mapToResponse(saved);
    }

    public List<TaskResponse> getTasksByClassroom(Long classroomId) {
        return taskRepository.findByClassroomId(classroomId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TaskResponse getTaskById(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return mapToResponse(task);
    }

    private TaskResponse mapToResponse(Task t) {
        return TaskResponse.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .classroomId(t.getClassroom().getId())
                .classroomName(t.getClassroom().getName())
                .deadline(t.getDeadline())
                .createdAt(t.getCreatedAt())
                .createdBy(UserDto.builder()
                        .id(t.getCreatedBy().getId())
                        .name(t.getCreatedBy().getName())
                        .email(t.getCreatedBy().getEmail())
                        .role(t.getCreatedBy().getRole())
                        .active(t.getCreatedBy().isActive())
                        .build())
                .build();
    }
}
