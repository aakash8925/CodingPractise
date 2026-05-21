package com.classroom.platform.service;

import com.classroom.platform.dto.ClassroomRequest;
import com.classroom.platform.dto.ClassroomResponse;
import com.classroom.platform.dto.UserDto;
import com.classroom.platform.entity.Classroom;
import com.classroom.platform.entity.Role;
import com.classroom.platform.entity.User;
import com.classroom.platform.repository.ClassroomRepository;
import com.classroom.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassroomService {
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional
    public ClassroomResponse createClassroom(ClassroomRequest request) {
        User user = getCurrentUser();
        if (user.getRole() != Role.TEACHER && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only teachers or admins can create classrooms");
        }

        Classroom classroom = Classroom.builder()
                .name(request.getName())
                .teacher(user)
                .build();

        Classroom saved = classroomRepository.save(classroom);
        return mapToResponse(saved);
    }

    public List<ClassroomResponse> getMyClassrooms() {
        User user = getCurrentUser();
        List<Classroom> classrooms;
        if (user.getRole() == Role.TEACHER) {
            classrooms = classroomRepository.findByTeacherId(user.getId());
        } else if (user.getRole() == Role.STUDENT) {
            classrooms = classroomRepository.findByStudentsId(user.getId());
        } else {
            classrooms = classroomRepository.findAll();
        }

        return classrooms.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClassroomResponse joinClassroom(Long classroomId) {
        User user = getCurrentUser();
        if (user.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can join classrooms");
        }

        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        classroom.getStudents().add(user);
        Classroom updated = classroomRepository.save(classroom);
        return mapToResponse(updated);
    }

    public ClassroomResponse getById(Long id) {
        Classroom classroom = classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        return mapToResponse(classroom);
    }

    public List<ClassroomResponse> getAllClassrooms() {
        return classroomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getStudentsInClassroom(Long classroomId) {
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        return classroom.getStudents().stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .active(u.isActive())
                        .build())
                .collect(Collectors.toList());
    }

    private ClassroomResponse mapToResponse(Classroom c) {
        return ClassroomResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .teacher(UserDto.builder()
                        .id(c.getTeacher().getId())
                        .name(c.getTeacher().getName())
                        .email(c.getTeacher().getEmail())
                        .role(c.getTeacher().getRole())
                        .active(c.getTeacher().isActive())
                        .build())
                .createdAt(c.getCreatedAt())
                .studentCount(c.getStudents() != null ? c.getStudents().size() : 0)
                .build();
    }
}
