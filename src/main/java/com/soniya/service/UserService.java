package com.soniya.service;

import com.soniya.dto.UserUpdateRequest;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =====================================================
    // ADMIN - GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    // =====================================================
    // ADMIN - GET USER BY ID
    // =====================================================

    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );
    }

    // =====================================================
    // ADMIN - UPDATE USER
    // =====================================================

    public User updateUser(
            Long id,
            UserUpdateRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        // Update name
        if (request.getName() != null &&
                !request.getName().isBlank()) {

            user.setName(request.getName());
        }

        // Update email
        if (request.getEmail() != null &&
                !request.getEmail().isBlank()) {

            user.setEmail(request.getEmail());
        }

        // Update password
        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        return userRepository.save(user);
    }

    // =====================================================
    // ADMIN - DELETE USER
    // =====================================================

    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + id
                        )
                );

        userRepository.delete(user);
    }

    // =====================================================
    // USER - UPDATE OWN PROFILE
    // =====================================================

    public User updateOwnProfile(
            String email,
            UserUpdateRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        )
                );

        // Update name
        if (request.getName() != null &&
                !request.getName().isBlank()) {

            user.setName(request.getName());
        }

        // Update email
        if (request.getEmail() != null &&
                !request.getEmail().isBlank()) {

            user.setEmail(request.getEmail());
        }

        // Update password
        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        return userRepository.save(user);
    }

    // =====================================================
    // USER - DELETE OWN ACCOUNT
    // =====================================================

    public void deleteOwnProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: " + email
                        )
                );

        userRepository.delete(user);
    }
}