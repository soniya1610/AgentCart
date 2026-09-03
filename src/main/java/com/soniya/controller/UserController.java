package com.soniya.controller;

import com.soniya.dto.UserUpdateRequest;
import com.soniya.entity.User;
import com.soniya.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // =====================================================
    // USER - GET OWN PROFILE
    // =====================================================

    @GetMapping("/user/profile")
    public Map<String, Object> profile(
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", "JWT authentication successful");
        response.put("email", authentication.getName());
        response.put("authorities", authentication.getAuthorities());

        return response;
    }

    // =====================================================
    // USER - UPDATE OWN PROFILE
    // =====================================================

    @PutMapping("/user/profile")
    public ResponseEntity<User> updateOwnProfile(
            Authentication authentication,
            @RequestBody UserUpdateRequest request) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                userService.updateOwnProfile(email, request)
        );
    }

    // =====================================================
    // USER - DELETE OWN ACCOUNT
    // =====================================================

    @DeleteMapping("/user/profile")
    public ResponseEntity<String> deleteOwnProfile(
            Authentication authentication) {

        String email = authentication.getName();

        userService.deleteOwnProfile(email);

        return ResponseEntity.ok(
                "Your account has been deleted successfully"
        );
    }

    // =====================================================
    // ADMIN - GET ALL USERS
    // =====================================================

    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    // =====================================================
    // ADMIN - GET USER BY ID
    // =====================================================

    @GetMapping("/admin/users/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    // =====================================================
    // ADMIN - UPDATE USER
    // =====================================================

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest request) {

        return ResponseEntity.ok(
                userService.updateUser(id, request)
        );
    }

    // =====================================================
    // ADMIN - DELETE USER
    // =====================================================

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id) {

        userService.deleteUser(id);

        return ResponseEntity.ok(
                "User deleted successfully"
        );
    }
}