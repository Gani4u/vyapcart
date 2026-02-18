package com.vyapkart.auth;

import com.vyapkart.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request
    ) throws Exception {

        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request
    ) throws Exception {

        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/firebase-login")
    public ResponseEntity<?> firebaseLogin(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody(required = false) FirebaseLoginRequest request
    ) throws Exception {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing Firebase token");
        }

        String firebaseToken = authHeader.substring(7);

        return ResponseEntity.ok(authService.firebaseLogin(firebaseToken, request));
    }

}
