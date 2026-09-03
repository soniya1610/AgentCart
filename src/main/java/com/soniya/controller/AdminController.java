package com.soniya.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Welcome to Admin Dashboard");
        response.put("email", authentication.getName());
        response.put("role", authentication.getAuthorities());

        return response;
    }
}