package com.vyapkart.auth;

import com.vyapkart.user.Role;

public record AuthResponse(
        String uid,
        String email,
        Role role,
        String token
) {}