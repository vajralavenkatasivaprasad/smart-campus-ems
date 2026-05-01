package com.campus.ems.repository;

import com.campus.ems.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// ==================== UserRepository ====================
@Repository
interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(User.Role role);
}

// ==================== EventRepository ====================
@Repository
interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(Event.Status status);
    List<Event> findByCategory(Event.Category category);
    List<Event> findByIsFeaturedTrue();

    @Query("SELECT e FROM Event e WHERE e.organizer.id = :organizerId ORDER BY e.startDatetime DESC")
    List<Event> findByOrganizerId(@Param("organizerId") Long organizerId);

    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Event> searchEvents(@Param("keyword") String keyword);

    @Query("SELECT e FROM Event e WHERE e.status = 'UPCOMING' ORDER BY e.startDatetime ASC")
    List<Event> findUpcomingEvents();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.status = :status")
    Long countByStatus(@Param("status") Event.Status status);
}

// ==================== RegistrationRepository ====================
@Repository
interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByUserId(Long userId);
    List<Registration> findByEventId(Long eventId);
    Optional<Registration> findByEventIdAndUserId(Long eventId, Long userId);
    boolean existsByEventIdAndUserId(Long eventId, Long userId);
    Optional<Registration> findByRegistrationCode(String code);

    @Query("SELECT COUNT(r) FROM Registration r WHERE r.event.id = :eventId AND r.status = 'CONFIRMED'")
    Long countConfirmedByEventId(@Param("eventId") Long eventId);
}

// ==================== NotificationRepository ====================
@Repository
interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
    Long countByUserIdAndIsReadFalse(Long userId);
}

// ==================== FeedbackRepository ====================
@Repository
interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEventId(Long eventId);
    Optional<Feedback> findByEventIdAndUserId(Long eventId, Long userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.event.id = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Long eventId);
}
