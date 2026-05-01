package com.campus.ems.service;

import com.campus.ems.model.Event;
import com.campus.ems.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final EventRepository eventRepository;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public Map<String, String> chat(String message) {
        String lower = message.toLowerCase().trim();
        String response = processMessage(lower);
        return Map.of("response", response, "timestamp", LocalDateTime.now().format(DATE_FMT));
    }

    private String processMessage(String msg) {
        // Greetings
        if (matches(msg, "hello", "hi", "hey", "greetings", "good morning", "good evening")) {
            return "👋 Hello! Welcome to Smart Campus EMS! I'm your AI assistant.\n\n" +
                   "I can help you with:\n" +
                   "📅 Finding upcoming events\n" +
                   "🔍 Searching events by category\n" +
                   "📝 Registration information\n" +
                   "📍 Venue & location details\n\n" +
                   "What would you like to know?";
        }

        // Upcoming events
        if (matches(msg, "upcoming", "next event", "what's happening", "schedule", "events today")) {
            List<Event> events = eventRepository.findUpcomingEvents();
            if (events.isEmpty()) {
                return "📭 No upcoming events at the moment. Check back soon!";
            }
            StringBuilder sb = new StringBuilder("📅 **Upcoming Events:**\n\n");
            events.stream().limit(4).forEach(e ->
                sb.append("🎯 **").append(e.getTitle()).append("**\n")
                  .append("   📍 ").append(e.getVenue()).append("\n")
                  .append("   🕐 ").append(e.getStartDatetime().format(DATE_FMT)).append("\n\n")
            );
            return sb.toString();
        }

        // Technical events
        if (matches(msg, "technical", "tech", "coding", "hackathon", "programming")) {
            return getEventsByCategory("TECHNICAL", "💻 Technical Events");
        }

        // Cultural events
        if (matches(msg, "cultural", "culture", "dance", "music", "drama", "art")) {
            return getEventsByCategory("CULTURAL", "🎭 Cultural Events");
        }

        // Sports
        if (matches(msg, "sports", "cricket", "football", "game", "tournament", "athletics")) {
            return getEventsByCategory("SPORTS", "⚽ Sports Events");
        }

        // Workshops
        if (matches(msg, "workshop", "training", "hands-on", "practical", "lab")) {
            return getEventsByCategory("WORKSHOP", "🔧 Workshops");
        }

        // Seminars
        if (matches(msg, "seminar", "talk", "lecture", "presentation", "research")) {
            return getEventsByCategory("SEMINAR", "🎤 Seminars");
        }

        // Registration help
        if (matches(msg, "register", "registration", "sign up", "enroll", "book")) {
            return "📝 **How to Register for an Event:**\n\n" +
                   "1. 🔐 Log in to your account\n" +
                   "2. 📅 Browse the Events section\n" +
                   "3. 🖱️ Click on your desired event\n" +
                   "4. ✅ Click **Register Now**\n" +
                   "5. 📧 You'll receive a confirmation email with your QR code\n\n" +
                   "💡 **Tip:** Register early — events fill up fast!\n\n" +
                   "Need help registering? Visit the Events page.";
        }

        // QR Code help
        if (matches(msg, "qr", "qr code", "ticket", "check in", "attendance")) {
            return "📱 **About QR Code Tickets:**\n\n" +
                   "After registering for an event, you'll receive:\n" +
                   "• A unique **QR Code** for entry\n" +
                   "• A **Registration Code** (e.g., EMS-0001-000001)\n" +
                   "• Email confirmation with all details\n\n" +
                   "📲 Show your QR Code at the event entrance for quick check-in!";
        }

        // Cancel registration
        if (matches(msg, "cancel", "unregister", "withdraw")) {
            return "❌ **Cancelling a Registration:**\n\n" +
                   "1. Go to **My Registrations** in your dashboard\n" +
                   "2. Find the event you want to cancel\n" +
                   "3. Click **Cancel Registration**\n" +
                   "4. Confirm the cancellation\n\n" +
                   "⚠️ Note: Please cancel at least 24 hours before the event.";
        }

        // Contact / Help
        if (matches(msg, "help", "support", "contact", "problem", "issue")) {
            return "🆘 **Need Help?**\n\n" +
                   "📧 Email: support@campus.edu\n" +
                   "📞 Phone: +91 98765 43210\n" +
                   "🏢 Office: Admin Block, Room 101\n" +
                   "⏰ Hours: Mon–Fri, 9 AM – 5 PM\n\n" +
                   "Or describe your issue and I'll try to assist you!";
        }

        // Featured / Popular
        if (matches(msg, "featured", "popular", "best", "recommended", "top")) {
            List<Event> featured = eventRepository.findByIsFeaturedTrue();
            if (featured.isEmpty()) {
                return "⭐ No featured events right now. Check back soon!";
            }
            StringBuilder sb = new StringBuilder("⭐ **Featured Events:**\n\n");
            featured.forEach(e ->
                sb.append("🌟 **").append(e.getTitle()).append("**\n")
                  .append("   📍 ").append(e.getVenue()).append("\n")
                  .append("   👥 Capacity: ").append(e.getMaxCapacity()).append("\n\n")
            );
            return sb.toString();
        }

        // Venue / Location
        if (matches(msg, "venue", "location", "where", "map", "place")) {
            return "📍 **Campus Venues:**\n\n" +
                   "🏛️ **Main Auditorium** – Block A, Ground Floor\n" +
                   "🎭 **Open Air Theatre** – Near Central Lawn\n" +
                   "💻 **CS Lab 301** – CS Block, 3rd Floor\n" +
                   "🏏 **Cricket Ground** – South Campus\n" +
                   "🎤 **Seminar Hall B** – Academic Block\n\n" +
                   "📱 Use the **Map** feature in the app to get directions!";
        }

        // OTP help
        if (matches(msg, "otp", "verification", "verify", "code not received")) {
            return "🔐 **OTP Verification Help:**\n\n" +
                   "1. Check your **registered email inbox**\n" +
                   "2. Also check the **Spam/Junk** folder\n" +
                   "3. OTP is valid for **10 minutes**\n" +
                   "4. Click **Resend OTP** if not received\n\n" +
                   "📧 Make sure you entered the correct email address during registration.";
        }

        // Stats / Numbers
        if (matches(msg, "stats", "statistics", "how many", "count", "total")) {
            long total = eventRepository.count();
            long upcoming = eventRepository.countByStatus(Event.Status.UPCOMING);
            return "📊 **Campus EMS Statistics:**\n\n" +
                   "📅 Total Events: " + total + "\n" +
                   "🔜 Upcoming Events: " + upcoming + "\n" +
                   "🎓 Smart Campus EMS is growing every day!\n\n" +
                   "Register for events to be part of the action! 🚀";
        }

        // Farewell
        if (matches(msg, "bye", "goodbye", "see you", "thanks", "thank you")) {
            return "👋 Goodbye! Have a great time on campus!\n\n" +
                   "Don't forget to check out our upcoming events. See you soon! 🎓✨";
        }

        // Default
        return "🤔 I'm not sure I understood that. Here are some things I can help with:\n\n" +
               "• Type **'upcoming'** to see upcoming events\n" +
               "• Type **'technical'** or **'cultural'** for event categories\n" +
               "• Type **'register'** to learn how to register\n" +
               "• Type **'help'** for support contact\n" +
               "• Type **'venue'** for location info\n\n" +
               "What would you like to know? 😊";
    }

    private String getEventsByCategory(String category, String label) {
        try {
            List<Event> events = eventRepository.findByCategory(Event.Category.valueOf(category));
            if (events.isEmpty()) {
                return "📭 No " + label.toLowerCase() + " found at the moment.";
            }
            StringBuilder sb = new StringBuilder(label + ":\n\n");
            events.stream().limit(4).forEach(e ->
                sb.append("• **").append(e.getTitle()).append("**\n")
                  .append("  📍 ").append(e.getVenue())
                  .append(" | 🕐 ").append(e.getStartDatetime().format(DATE_FMT)).append("\n\n")
            );
            return sb.toString();
        } catch (Exception e) {
            return "⚠️ Error fetching events. Please try again.";
        }
    }

    private boolean matches(String message, String... keywords) {
        for (String kw : keywords) {
            if (message.contains(kw)) return true;
        }
        return false;
    }
}
