# 🎓 Smart Campus Event Management System (EMS)

A full-stack, innovative Smart Campus EMS built with **HTML/CSS/JavaScript** (Frontend), **Spring Boot** (Backend), and **MySQL** (Database) — with advanced innovation modules including OTP verification, AI Chatbot, Interactive Maps, QR Code tickets, and Real-time Notifications.

---

## 🚀 Features

### Core Modules
| Module | Description |
|---|---|
| 🔐 **Auth + OTP** | Email-based registration with OTP verification via SMTP |
| 📅 **Event Management** | CRUD for events with categories, capacity, and status tracking |
| 🎟️ **Registration + QR** | One-click event registration with auto-generated QR code tickets |
| 📍 **Campus Map** | Interactive Leaflet.js map showing all event locations |
| 🔔 **Notifications** | Real-time in-app notifications for events and registrations |
| 🤖 **AI Chatbot** | NLP-powered campus assistant for event queries |
| 🔍 **Smart Search** | Live search across all events with instant dropdown |
| 📊 **Admin Dashboard** | Full event/user management with analytics |
| 📧 **Email Service** | Confirmation emails for registration and OTP |
| ⭐ **Featured Events** | Highlighted featured events on dashboard |

### Innovation Highlights
- **OTP Email Verification** — Secure 6-digit OTP with 10-min expiry
- **QR Code Generation** — ZXing-based QR codes for event check-in
- **Interactive Map** — Leaflet.js with custom event markers by category
- **AI Chatbot** — Context-aware campus assistant with smart replies
- **JWT Authentication** — Stateless auth with token-based sessions
- **Role-Based Access** — Admin / Organizer / Student roles
- **Live Search** — Real-time event search with keyboard navigation

---

## 🏗️ Project Structure

```
smart-campus-ems/
├── frontend/                  # HTML/CSS/JS Frontend
│   ├── index.html             # Main SPA
│   ├── css/
│   │   └── style.css          # Complete stylesheet (2000+ lines)
│   └── js/
│       └── app.js             # Full application logic
│
├── backend/                   # Spring Boot Backend
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/campus/ems/
│       │   ├── SmartCampusEmsApplication.java
│       │   ├── model/         # JPA Entities
│       │   │   ├── User.java
│       │   │   ├── Event.java
│       │   │   ├── Registration.java
│       │   │   ├── Notification.java
│       │   │   └── Feedback.java
│       │   ├── repository/    # JPA Repositories
│       │   │   └── Repositories.java
│       │   ├── service/       # Business Logic
│       │   │   ├── AuthService.java
│       │   │   ├── EventService.java
│       │   │   └── ChatbotService.java
│       │   ├── controller/    # REST Controllers
│       │   │   └── Controllers.java
│       │   └── config/        # Security & JWT
│       │       ├── JwtUtil.java
│       │       └── SecurityConfig.java
│       └── resources/
│           └── application.properties
│
└── database/
    └── schema.sql             # MySQL schema + seed data
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Node.js (optional, for live server)

### 1. Database Setup
```sql
-- Run the schema file
mysql -u root -p < database/schema.sql
```

### 2. Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus_ems
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

### 3. Run Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs at: `http://localhost:8080`

### 4. Run Frontend
```bash
# Option 1: VS Code Live Server (recommended)
# Open frontend/index.html → Right Click → Open with Live Server

# Option 2: Python HTTP Server
cd frontend
python -m http.server 5500

# Option 3: Direct browser
# Open frontend/index.html directly in browser
```
Frontend runs at: `http://localhost:5500`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@campus.edu | password123 |
| Organizer | priya@campus.edu | password123 |
| Student | rahul@campus.edu | password123 |

> **Note:** Demo mode works without backend. All features are simulated client-side for demonstration.

---

## 📡 REST API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| GET | `/api/events/upcoming` | Get upcoming events |
| GET | `/api/events/featured` | Get featured events |
| GET | `/api/events/search?keyword=` | Search events |
| GET | `/api/events/{id}` | Get event by ID |
| POST | `/api/events` | Create event (Organizer/Admin) |
| PUT | `/api/events/{id}` | Update event |
| DELETE | `/api/events/{id}` | Delete event (Admin) |
| POST | `/api/events/{id}/register` | Register for event |
| DELETE | `/api/events/{id}/register` | Cancel registration |
| GET | `/api/events/my-registrations` | My registrations |
| GET | `/api/events/stats` | Dashboard statistics |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PUT | `/api/notifications/{id}/read` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Chatbot
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chatbot/chat` | Send message to chatbot |

### Feedback
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/feedback` | Submit event feedback |
| GET | `/api/feedback/event/{id}` | Get event feedback |

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Semantic structure
- **CSS3** — Custom properties, Grid, Flexbox, Animations
- **Vanilla JavaScript** — ES6+, Fetch API, async/await
- **Leaflet.js** — Interactive campus map
- **Font Awesome** — Icons
- **Google Fonts** — Inter + Space Grotesk

### Backend
- **Spring Boot 3.2** — REST API framework
- **Spring Security** — JWT authentication
- **Spring Data JPA** — ORM with Hibernate
- **Spring Mail** — OTP email delivery
- **ZXing** — QR code generation
- **Lombok** — Boilerplate reduction
- **BCrypt** — Password hashing

### Database
- **MySQL 8.0** — Primary database
- Tables: users, events, registrations, notifications, feedback, announcements, chatbot_logs

---

## 🎨 UI/UX Features
- **Dark Sidebar** with gradient logo
- **Responsive Design** — Mobile-first, works on all devices
- **Smooth Animations** — Page transitions, card hovers
- **Toast Notifications** — Real-time feedback
- **Loading Skeletons** — Better perceived performance
- **OTP Input Boxes** — Auto-focus navigation
- **Category Color Coding** — Visual event differentiation
- **Capacity Progress Bars** — Visual seat availability
- **Featured Cards** — Gradient hero cards on dashboard

---

## 📱 Screenshots Overview

### Pages Included:
1. **Login / Register / OTP Verification** pages
2. **Dashboard** — Stats, Featured Events, Upcoming Events
3. **Events Browser** — Filter by category, search
4. **Event Detail Modal** — Full info + registration
5. **My Registrations** — Registered events with QR codes
6. **Campus Map** — Interactive event location map
7. **Notifications** — Read/unread with badges
8. **Create Event** — Form for organizers
9. **Admin Panel** — Event/User management + Analytics
10. **AI Chatbot** — Floating assistant widget

---

## 👥 Roles & Permissions

| Feature | Student | Organizer | Admin |
|---|---|---|---|
| Browse Events | ✅ | ✅ | ✅ |
| Register for Events | ✅ | ✅ | ✅ |
| Create Events | ❌ | ✅ | ✅ |
| Edit Events | ❌ | Own only | ✅ |
| Delete Events | ❌ | ❌ | ✅ |
| Admin Panel | ❌ | ❌ | ✅ |
| View Analytics | ❌ | ❌ | ✅ |

---

## 🔒 Security Features
- JWT tokens with configurable expiry
- BCrypt password hashing
- OTP with time-based expiry
- CORS configuration
- Role-based endpoint protection
- SQL injection prevention via JPA

---

## 📧 Email Templates
- **OTP Verification Email** — 6-digit OTP with expiry notice
- **Registration Confirmation** — Event details + unique reg code

---

*Built with ❤️ for Smart Campus Innovation*
