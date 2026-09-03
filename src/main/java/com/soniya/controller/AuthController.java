package com.soniya.controller;

import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        if (userRepository.existsByEmail(user.getEmail())) {

            Map<String, String> response = new HashMap<>();

            response.put("message", "Email already registered");

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        User savedUser = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();

        response.put("message", "User registered successfully");
        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("role", savedUser.getRole());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {

        User user = userRepository
                .findByEmail(loginRequest.getEmail())
                .orElse(null);

        // Email not found
        if (user == null) {

            Map<String, String> response = new HashMap<>();

            response.put("message", "Invalid email or password");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        // Check password
        boolean passwordMatches =
                passwordEncoder.matches(
                        loginRequest.getPassword(),
                        user.getPassword()
                );

        if (!passwordMatches) {

            Map<String, String> response = new HashMap<>();

            response.put("message", "Invalid email or password");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        // =========================
        // GENERATE JWT
        // =========================

        String token = jwtService.generateToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        java.util.Collections.emptyList()
                )
        );

        // Login successful
        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("token", token);
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }
}