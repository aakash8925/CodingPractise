package com.classroom.platform.controller;

import com.classroom.platform.dto.TaskRequest;
import com.classroom.platform.dto.TaskResponse;
import com.classroom.platform.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.createTask(request));
    }

    @GetMapping("/classroom/{classroomId}")
    public ResponseEntity<List<TaskResponse>> getByClassroom(@PathVariable Long classroomId) {
        return ResponseEntity.ok(taskService.getTasksByClassroom(classroomId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getById(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getTaskById(taskId));
    }
}
