package com.soniya.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Base64 encoded secret key
    private static final String SECRET_KEY =
            "c29uaXlhLWZsYXNoLXNlY3JldC1rZXktZm9yLWp3dC1hdXRoLTIwMjY=";

    // Token valid for 24 hours
    private static final long EXPIRATION_TIME =
            1000 * 60 * 60 * 24;


    // =========================
    // Generate Token
    // =========================

    public String generateToken(UserDetails userDetails) {

        Map<String, Object> claims = new HashMap<>();

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis()
                                + EXPIRATION_TIME)
                )
                .signWith(getSigningKey())
                .compact();
    }


    // =========================
    // Get Username from Token
    // =========================

    public String extractUsername(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }


    // =========================
    // Extract Any Claim
    // =========================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims = extractAllClaims(token);

        return claimsResolver.apply(claims);
    }


    // =========================
    // Extract All Claims
    // =========================

    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // =========================
    // Get Signing Key
    // =========================

    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(SECRET_KEY);

        return Keys.hmacShaKeyFor(keyBytes);
    }


    // =========================
    // Validate Token
    // =========================

    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        String username =
                extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }


    // =========================
    // Check Expiration
    // =========================

    private boolean isTokenExpired(String token) {

        Date expiration =
                extractClaim(
                        token,
                        Claims::getExpiration
                );

        return expiration.before(new Date());
    }
}