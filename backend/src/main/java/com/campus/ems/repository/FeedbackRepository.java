package com.campus.ems.repository;

import com.campus.ems.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    Optional<Feedback> findByEventIdAndUserId(Long eventId, Long userId);

    List<Feedback> findByEventId(Long eventId);
}