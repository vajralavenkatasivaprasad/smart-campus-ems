package com.campus.ems.service;

import com.campus.ems.model.*;
import com.campus.ems.repository.*;
import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final OtpService otpService;

    // ---- Event CRUD ----

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcomingEvents();
    }

    public List<Event> getFeaturedEvents() {
        return eventRepository.findByIsFeaturedTrue();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    public List<Event> searchEvents(String keyword) {
        return eventRepository.searchEvents(keyword);
    }

    public List<Event> getEventsByCategory(String category) {
        return eventRepository.findByCategory(Event.Category.valueOf(category.toUpperCase()));
    }

    public Event createEvent(Event event) {
        Event saved = eventRepository.save(event);
        // Notify all students
        notifyAllStudents("New Event: " + event.getTitle(),
                "A new event '" + event.getTitle() + "' has been added. Register now!", saved);
        return saved;
    }

    public Event updateEvent(Long id, Event updatedEvent) {
        return eventRepository.findById(id).map(event -> {
            event.setTitle(updatedEvent.getTitle());
            event.setDescription(updatedEvent.getDescription());
            event.setVenue(updatedEvent.getVenue());
            event.setStartDatetime(updatedEvent.getStartDatetime());
            event.setEndDatetime(updatedEvent.getEndDatetime());
            event.setMaxCapacity(updatedEvent.getMaxCapacity());
            event.setStatus(updatedEvent.getStatus());
            event.setLatitude(updatedEvent.getLatitude());
            event.setLongitude(updatedEvent.getLongitude());
            return eventRepository.save(event);
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    // ---- Registration ----

    @Transactional
    public Map<String, Object> registerForEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("Already registered for this event");
        }

        if (event.getRegisteredCount() >= event.getMaxCapacity()) {
            throw new RuntimeException("Event is at full capacity");
        }

        String regCode = "EMS-" + String.format("%04d", eventId) + "-" + String.format("%06d", userId) +
                "-" + System.currentTimeMillis() % 10000;

        String qrData = String.format("EVENT:%d|USER:%d|CODE:%s", eventId, userId, regCode);
        String qrBase64 = generateQrCode(qrData);

        Registration registration = Registration.builder()
                .event(event)
                .user(user)
                .registrationCode(regCode)
                .status(Registration.Status.CONFIRMED)
                .paymentStatus(Registration.PaymentStatus.FREE)
                .qrCode(qrBase64)
                .build();

        registrationRepository.save(registration);

        event.setRegisteredCount(event.getRegisteredCount() + 1);
        eventRepository.save(event);

        // Send confirmation notification
        Notification notification = Notification.builder()
                .user(user)
                .title("Registration Confirmed!")
                .message("You are registered for '" + event.getTitle() + "'. Code: " + regCode)
                .type(Notification.Type.SUCCESS)
                .event(event)
                .build();
        notificationRepository.save(notification);

        // Send email
        otpService.sendEventConfirmation(user.getEmail(), user.getName(), event.getTitle(), regCode);

        return Map.of(
            "message", "Registration successful!",
            "registrationCode", regCode,
            "qrCode", qrBase64 != null ? qrBase64 : ""
        );
    }

    public List<Registration> getUserRegistrations(Long userId) {
        return registrationRepository.findByUserId(userId);
    }

    public List<Registration> getEventRegistrations(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    @Transactional
    public void cancelRegistration(Long eventId, Long userId) {
        Registration reg = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Registration not found"));
        reg.setStatus(Registration.Status.CANCELLED);
        registrationRepository.save(reg);

        Event event = reg.getEvent();
        if (event.getRegisteredCount() > 0) {
            event.setRegisteredCount(event.getRegisteredCount() - 1);
            eventRepository.save(event);
        }
    }

    // ---- Statistics ----

    public Map<String, Object> getDashboardStats() {
        return Map.of(
            "totalEvents", eventRepository.count(),
            "upcomingEvents", eventRepository.countByStatus(Event.Status.UPCOMING),
            "completedEvents", eventRepository.countByStatus(Event.Status.COMPLETED),
            "totalRegistrations", registrationRepository.count()
        );
    }

    // ---- Helpers ----

    private String generateQrCode(String data) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(data, BarcodeFormat.QR_CODE, 200, 200);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", out);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
        } catch (Exception e) {
            return null;
        }
    }

    private void notifyAllStudents(String title, String message, Event event) {
        List<User> students = userRepository.findByRole(User.Role.STUDENT);
        for (User student : students) {
            Notification notification = Notification.builder()
                    .user(student)
                    .title(title)
                    .message(message)
                    .type(Notification.Type.INFO)
                    .event(event)
                    .build();
            notificationRepository.save(notification);
        }
    }
}
