package com.campus.ems.controller;

import com.campus.ems.model.*;
import com.campus.ems.service.*;
import com.campus.ems.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

// ==================== Auth Controller ====================
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.register(
                body.get("name"), body.get("email"), body.get("password"),
                body.get("phone"), body.get("department"),
                body.getOrDefault("role", "STUDENT")
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.verifyOtp(body.get("email"), body.get("otp")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.login(body.get("email"), body.get("password")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.resendOtp(body.get("email")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

// ==================== Event Controller ====================
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class EventController {

    private final EventService eventService;
    private final UserRepository userRepository;

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcoming() {
        return ResponseEntity.ok(eventService.getUpcomingEvents());
    }

    @GetMapping("/featured")
    public ResponseEntity<?> getFeatured() {
        return ResponseEntity.ok(eventService.getFeaturedEvents());
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String keyword) {
        return ResponseEntity.ok(eventService.searchEvents(keyword));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(eventService.getEventsByCategory(category));
    }

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEvent(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Map<String, Object> body,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User organizer = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Event event = buildEventFromBody(body, organizer);
            return ResponseEntity.ok(eventService.createEvent(event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable Long id,
                                         @RequestBody Map<String, Object> body) {
        try {
            Event event = buildEventFromBody(body, null);
            return ResponseEntity.ok(eventService.updateEvent(id, event));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted"));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> register(@PathVariable Long id,
                                      @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            return ResponseEntity.ok(eventService.registerForEvent(id, user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> cancelRegistration(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            eventService.cancelRegistration(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Registration cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<?> myRegistrations(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(eventService.getUserRegistrations(user.getId()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(eventService.getDashboardStats());
    }

    private Event buildEventFromBody(Map<String, Object> body, User organizer) {
        return Event.builder()
                .title((String) body.get("title"))
                .description((String) body.get("description"))
                .category(Event.Category.valueOf(((String) body.get("category")).toUpperCase()))
                .venue((String) body.get("venue"))
                .latitude(body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null)
                .longitude(body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null)
                .maxCapacity(body.get("maxCapacity") != null ? Integer.parseInt(body.get("maxCapacity").toString()) : 100)
                .isFeatured(body.get("isFeatured") != null && (Boolean) body.get("isFeatured"))
                .organizer(organizer)
                .status(Event.Status.UPCOMING)
                .build();
    }
}

// ==================== Notification Controller ====================
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(Map.of("count", notificationRepository.countByUserIdAndIsReadFalse(user.getId())));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        notificationRepository.findByUserIdAndIsReadFalse(user.getId()).forEach(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
        return ResponseEntity.ok(Map.of("message", "All marked as read"));
    }
}

// ==================== Feedback Controller ====================
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> body,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            Long eventId = Long.parseLong(body.get("eventId").toString());
            Event event = eventRepository.findById(eventId).orElseThrow();

            if (feedbackRepository.findByEventIdAndUserId(eventId, user.getId()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already submitted feedback"));
            }

            Feedback feedback = Feedback.builder()
                    .event(event)
                    .user(user)
                    .rating(Integer.parseInt(body.get("rating").toString()))
                    .comment((String) body.get("comment"))
                    .build();
            return ResponseEntity.ok(feedbackRepository.save(feedback));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getEventFeedback(@PathVariable Long eventId) {
        return ResponseEntity.ok(feedbackRepository.findByEventId(eventId));
    }
}

// ==================== Chatbot Controller ====================
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "");
        if (message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        return ResponseEntity.ok(chatbotService.chat(message));
    }
}
