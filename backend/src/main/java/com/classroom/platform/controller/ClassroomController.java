package com.classroom.platform.controller;

import com.classroom.platform.dto.ClassroomRequest;
import com.classroom.platform.dto.ClassroomResponse;
import com.classroom.platform.service.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {
    private final ClassroomService classroomService;

    @PostMapping
    public ResponseEntity<ClassroomResponse> create(@Valid @RequestBody ClassroomRequest request) {
        return ResponseEntity.ok(classroomService.createClassroom(request));
    }

    @GetMapping
    public ResponseEntity<List<ClassroomResponse>> getAll() {
        return ResponseEntity.ok(classroomService.getMyClassrooms());
    }

    @GetMapping("/all")
    public ResponseEntity<List<ClassroomResponse>> getAllClassrooms() {
        return ResponseEntity.ok(classroomService.getAllClassrooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassroomResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getById(id));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<ClassroomResponse> join(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.joinClassroom(id));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<com.classroom.platform.dto.UserDto>> getStudents(@PathVariable Long id) {
        return ResponseEntity.ok(classroomService.getStudentsInClassroom(id));
    }
}
