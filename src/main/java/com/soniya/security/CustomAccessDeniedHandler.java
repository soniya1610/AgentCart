package com.soniya.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException)
            throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");

        Map<String, Object> error = new HashMap<>();

        error.put("status", 403);
        error.put("error", "Forbidden");

        String method = request.getMethod();
        String uri = request.getRequestURI();

        if (uri.startsWith("/products")) {

            if (method.equals("POST")) {

                error.put(
                        "message",
                        "USER is not allowed to create products. Only ADMIN can create products."
                );

            } else if (method.equals("PUT")) {

                error.put(
                        "message",
                        "USER is not allowed to update products. Only ADMIN can update products."
                );

            } else if (method.equals("DELETE")) {

                error.put(
                        "message",
                        "USER is not allowed to delete products. Only ADMIN can delete products."
                );

            } else {

                error.put(
                        "message",
                        "You do not have permission to access this resource."
                );
            }

        } else {

            error.put(
                    "message",
                    "You do not have permission to access this resource."
            );
        }

        objectMapper.writeValue(
                response.getOutputStream(),
                error
        );
    }
}