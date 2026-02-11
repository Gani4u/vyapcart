package com.vyapkart.auth;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.vyapkart.security.JwtUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log =
            LoggerFactory.getLogger(AuthController.class);

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping("/firebase-login")
public AuthResponse firebaseLogin(
        @RequestHeader("Authorization") String authHeader
) throws Exception {

    String idToken = authHeader.replace("Bearer ", "");

    FirebaseToken decodedToken =
            FirebaseAuth.getInstance().verifyIdToken(idToken);

    String uid = decodedToken.getUid();
    String email = decodedToken.getEmail();

    User user = userService.getOrCreateUser(uid, email);

    String jwt = jwtUtil.generateToken(
            user.getId().toString(),
            user.getEmail()
    );

    return new AuthResponse(
            uid,
            email,
            jwt
    );
}
}
