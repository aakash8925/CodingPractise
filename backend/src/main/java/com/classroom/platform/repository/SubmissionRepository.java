package com.classroom.platform.repository;

import com.classroom.platform.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    // JOIN FETCH fixes N+1: fetches task + student in a single SQL query instead of 1 + N queries
    @Query("SELECT s FROM Submission s JOIN FETCH s.task t JOIN FETCH t.classroom JOIN FETCH s.student WHERE t.id = :taskId")
    List<Submission> findByTaskId(@Param("taskId") Long taskId);

    @Query("SELECT s FROM Submission s JOIN FETCH s.task t JOIN FETCH t.classroom JOIN FETCH s.student WHERE s.student.id = :studentId")
    List<Submission> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT s FROM Submission s JOIN FETCH s.task t JOIN FETCH s.student WHERE t.id = :taskId AND s.student.id = :studentId")
    Optional<Submission> findByTaskIdAndStudentId(@Param("taskId") Long taskId, @Param("studentId") Long studentId);

    // Used by admin — also fetched in one query
    @Query("SELECT s FROM Submission s JOIN FETCH s.task t JOIN FETCH t.classroom JOIN FETCH s.student ORDER BY s.updatedAt DESC")
    List<Submission> findAllWithDetails();
}
