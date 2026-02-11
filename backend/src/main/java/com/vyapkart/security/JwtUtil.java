package com.vyapkart.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component // ⭐ THIS IS THE FIX
public class JwtUtil {

    private final String SECRET_KEY = "WNi3oF3NfduzvwUiOPlnDdUUjIlMcv7fX28ms3udpPM="; // move to env later
    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hrs

    public String generateToken(String userId, String email, String role) {

    return Jwts.builder()
            .setSubject(userId)
            .claim("email", email)
            .claim("role", role)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
            .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
            .compact();
}
}
