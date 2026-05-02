package com.campus.ems.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(length = 200)
    private String venue;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "max_capacity")
    private Integer maxCapacity = 100;

    @Column(name = "registered_count")
    private Integer registeredCount = 0;

    @Column(name = "banner_image")
    private String bannerImage;

    @Enumerated(EnumType.STRING)
    private Status status = Status.UPCOMING;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Category {
        ACADEMIC, CULTURAL, SPORTS, TECHNICAL, WORKSHOP, SEMINAR, OTHER
    }

    public enum Status {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }
}
