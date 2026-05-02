package com.campus.ems.repository;

import com.campus.ems.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("SELECT e FROM Event e WHERE e.startDatetime > CURRENT_TIMESTAMP")
    List<Event> findUpcomingEvents();

    List<Event> findByIsFeaturedTrue();

    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Event> searchEvents(@Param("keyword") String keyword);

    List<Event> findByCategory(Event.Category category);

    long countByStatus(Event.Status status);
}