package com.classroom.platform.repository;

import com.classroom.platform.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // JOIN FETCH avoids N+1 when accessing task.classroom and task.createdBy
    @Query("SELECT t FROM Task t JOIN FETCH t.classroom c JOIN FETCH t.createdBy WHERE c.id = :classroomId ORDER BY t.deadline ASC")
    List<Task> findByClassroomId(@Param("classroomId") Long classroomId);

    @Query("SELECT t FROM Task t JOIN FETCH t.classroom JOIN FETCH t.createdBy WHERE t.createdBy.id = :teacherId ORDER BY t.createdAt DESC")
    List<Task> findByCreatedById(@Param("teacherId") Long teacherId);

    // Fetch a single task with all associations in one query
    @Query("SELECT t FROM Task t JOIN FETCH t.classroom JOIN FETCH t.createdBy WHERE t.id = :id")
    Optional<Task> findByIdWithDetails(@Param("id") Long id);
}
