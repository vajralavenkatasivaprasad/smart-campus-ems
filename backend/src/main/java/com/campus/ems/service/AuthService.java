package com.campus.ems.service;

import com.campus.ems.config.JwtUtil;
import com.campus.ems.model.User;
import com.campus.ems.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ==================== UserDetailsService ====================
@Service
@RequiredArgsConstructor
class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();
    }
}

// ==================== OTP Service ====================
@Service
@RequiredArgsConstructor
class OtpService {

    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    public String generateOtp() {
        return String.format("%06d", random.nextInt(999999));
    }

    public void sendOtpEmail(String toEmail, String otp, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("🎓 Smart Campus EMS - Email Verification OTP");
            message.setText(String.format(
                "Hello %s,\n\n" +
                "Your OTP for Smart Campus EMS verification is:\n\n" +
                "  ► %s ◄\n\n" +
                "This OTP is valid for 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Best regards,\nSmart Campus EMS Team",
                name, otp
            ));
            mailSender.send(message);
        } catch (Exception e) {
            // Log and continue — OTP stored in DB for demo purposes
            System.err.println("Mail send failed: " + e.getMessage());
        }
    }

    public void sendEventConfirmation(String toEmail, String name, String eventTitle, String regCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("✅ Registration Confirmed - " + eventTitle);
            message.setText(String.format(
                "Hello %s,\n\n" +
                "Your registration for '%s' is CONFIRMED!\n\n" +
                "Registration Code: %s\n\n" +
                "Please keep this code for check-in at the event.\n\n" +
                "Best regards,\nSmart Campus EMS Team",
                name, eventTitle, regCode
            ));
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Confirmation mail failed: " + e.getMessage());
        }
    }
}

// ==================== Auth Service ====================
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    public Map<String, Object> register(String name, String email, String password,
                                        String phone, String department, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        String otp = otpService.generateOtp();
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .phone(phone)
                .department(department)
                .role(User.Role.valueOf(role.toUpperCase()))
                .isVerified(false)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();

        userRepository.save(user);
        otpService.sendOtpEmail(email, otp, name);

        return Map.of(
            "message", "Registration successful. Please verify your email with the OTP sent.",
            "email", email
        );
    }

    public Map<String, Object> verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!otp.equals(user.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new RuntimeException("OTP expired");
        }

        user.setIsVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        String token = jwtUtil.generateToken(email);
        return Map.of("token", token, "message", "Email verified successfully!", "user", buildUserResponse(user));
    }

    public Map<String, Object> login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getIsVerified()) {
            throw new RuntimeException("Please verify your email first");
        }

        String token = jwtUtil.generateToken(email);
        return Map.of("token", token, "user", buildUserResponse(user));
    }

    public Map<String, Object> resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        otpService.sendOtpEmail(email, otp, user.getName());

        return Map.of("message", "OTP resent successfully");
    }

    private Map<String, Object> buildUserResponse(User user) {
        return Map.of(
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "department", user.getDepartment() != null ? user.getDepartment() : "",
            "phone", user.getPhone() != null ? user.getPhone() : ""
        );
    }
}
