package com.soniya.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomAccessDeniedHandler customAccessDeniedHandler) {

        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
    }

    // =========================
    // PASSWORD ENCODER
    // =========================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================
    // AUTHENTICATION PROVIDER
    // =========================

    @Bean
    public AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // =========================
    // SECURITY FILTER CHAIN
    // =========================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        // Disable CSRF because we are using JWT
        http.csrf(csrf -> csrf.disable());

        // Stateless session
        http.sessionManagement(session ->
                session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS
                )
        );

        // Access denied handler
        http.exceptionHandling(exception ->
                exception.accessDeniedHandler(
                        customAccessDeniedHandler
                )
        );

        // =========================
        // AUTHORIZATION RULES
        // =========================

        http.authorizeHttpRequests(auth -> {
        	
        	auth.requestMatchers(
        	        "/",
        	        "/index.html",
        	        "/login.html",
        	        "/register.html",
        	        "/products.html",
        	        "/product-details.html",
        	        "/negotiation.html",
        	        "/cart.html",
        	        "/checkout.html",
        	        "/orders.html",
        	        "/profile.html",
        	        "/admin.html",
        	        "/assets/**",
        	        "/favicon.ico"
        	).permitAll();

            // =========================
            // PUBLIC APIs
            // =========================

            auth.requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login"
            ).permitAll();


            // =========================
            // PRODUCT APIs
            // =========================

            // USER + ADMIN can view products
            auth.requestMatchers(
                    HttpMethod.GET,
                    "/products",
                    "/products/**"
            ).hasAnyRole("USER", "ADMIN");

            // ONLY ADMIN can create products
            auth.requestMatchers(
                    HttpMethod.POST,
                    "/products"
            ).hasRole("ADMIN");

            // ONLY ADMIN can update products
            auth.requestMatchers(
                    HttpMethod.PUT,
                    "/products/**"
            ).hasRole("ADMIN");

            // ONLY ADMIN can delete products
            auth.requestMatchers(
                    HttpMethod.DELETE,
                    "/products/**"
            ).hasRole("ADMIN");


            // =========================
            // NEGOTIATION APIs
            // =========================

            // USER + ADMIN
            auth.requestMatchers(
                    "/api/negotiations/**"
            ).hasAnyRole("USER", "ADMIN");


            // =========================
            // PAYMENT APIs
            // =========================

            // USER + ADMIN can access payment APIs
            auth.requestMatchers(
                    "/api/payments/**"
            ).hasAnyRole("USER", "ADMIN");


            // =========================
            // ADMIN APIs
            // =========================

            // ONLY ADMIN
            auth.requestMatchers(
                    "/api/admin/**"
            ).hasRole("ADMIN");


            // =========================
            // USER APIs
            // =========================

            // USER + ADMIN
            auth.requestMatchers(
                    "/api/user/**"
            ).hasAnyRole("USER", "ADMIN");


            // =========================
            // EVERYTHING ELSE
            // =========================

            auth.anyRequest().authenticated();
        });


        // =========================
        // AUTHENTICATION PROVIDER
        // =========================

        http.authenticationProvider(
                authenticationProvider()
        );


        // =========================
        // JWT FILTER
        // =========================

        http.addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
        );


        return http.build();
    }
}