package com.vyapkart.auth.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.vyapkart.auth.*;
import com.vyapkart.exception.AuthException;
import com.vyapkart.security.JwtUtil;
import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.entity.SellerStatus;
import com.vyapkart.seller.repository.SellerRepository;
import com.vyapkart.user.entity.*;
import com.vyapkart.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;


@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       UserRoleRepository userRoleRepository,
                       SellerRepository sellerRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.sellerRepository = sellerRepository;
        this.jwtUtil = jwtUtil;
    }

    /* =========================
       LOGIN
    ========================== */
    public AuthResponse login(LoginRequest request) throws Exception {

        FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());

        String uid = decodedToken.getUid();

        User user = userRepository.findByFirebaseUid(uid)
                .orElseThrow(() ->
                        new AuthException(
                                "USER_NOT_REGISTERED",
                                "User not found. Please register first."
                        )
                );

        String jwt = jwtUtil.generateToken(user);

        return buildResponse(user, jwt);
    }

    /* =========================
       REGISTER
    ========================== */
    public AuthResponse register(RegisterRequest request) throws Exception {

        // Validate role
        validateRole(request.getRole());

        FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());

        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();

        if (userRepository.existsByFirebaseUid(uid)) {
            throw new AuthException(
                    "USER_ALREADY_REGISTERED",
                    "User already registered. Please login."
            );
        }

        // If SELLER, validate seller fields
        if ("SELLER".equalsIgnoreCase(request.getRole())) {
            validateSellerFields(request);
        }

        User user = new User();
        user.setFirebaseUid(uid);
        user.setEmail(email);
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);

        // Assign role
        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() ->
                        new AuthException("INVALID_ROLE", "Invalid role selected.")
                );

        UserRole userRole = new UserRole(user, role);
        userRoleRepository.save(userRole);

        // If SELLER, create seller record
        if ("SELLER".equalsIgnoreCase(request.getRole())) {
            Seller seller = Seller.builder()
                    .user(user)
                    .businessName(request.getBusinessName())
                    .gstNumber(request.getGstNumber())
                    .status(SellerStatus.PENDING)
                    .build();

            sellerRepository.save(seller);
        }

        String jwt = jwtUtil.generateToken(user);

        return buildResponse(user, jwt);
    }

    /* =========================
       FIREBASE LOGIN
    ========================== */
    public AuthResponse firebaseLogin(String firebaseToken, FirebaseLoginRequest request) throws Exception {

        // Verify Firebase token
        FirebaseToken decodedToken =
                FirebaseAuth.getInstance().verifyIdToken(firebaseToken);

        String uid = decodedToken.getUid();
        String email = decodedToken.getEmail();

        // Try find by firebase uid
        Optional<User> byUid = userRepository.findByFirebaseUid(uid);

        // If this call is a LOGIN (no request body or empty request), treat it as pure login.
        // For login we MUST NOT auto-create users or throw EMAIL_ALREADY_LINKED (to avoid duplicate-email insertions).
        boolean isLoginRequest = !isRegistrationRequest(request);
        if (isLoginRequest) {
            if (byUid.isPresent()) {
                // existing user found by uid -> proceed
                User userFound = byUid.get();
                String jwt = jwtUtil.generateToken(userFound);
                return buildResponse(userFound, jwt);
            }

            // No body and no user -> user must register first
            throw new AuthException("USER_NOT_REGISTERED", "User not found. Please register first.");
        }

        // From here: request != null -> registration/login-with-data flow
        User user = byUid.orElseGet(() -> {
            // Not found by uid — attempt to find by email to avoid duplicate email insertion
            Optional<User> byEmail = userRepository.findByEmail(email);

            if (byEmail.isPresent()) {
                User existing = byEmail.get();

                // If existing user has no firebaseUid, link it
                if (existing.getFirebaseUid() == null || existing.getFirebaseUid().isBlank()) {
                    existing.setFirebaseUid(uid);
                    if (request != null) {
                        if (request.getFullName() != null) existing.setFullName(request.getFullName());
                        if (request.getPhone() != null) existing.setPhone(request.getPhone());
                    }
                    return userRepository.save(existing);
                }

                // Email already linked to another firebase account
                throw new AuthException("EMAIL_ALREADY_LINKED", "Email already linked to another account");
            }

            // New user registration via firebase-login endpoint
            // Validate role
            validateRole(request.getRole());

            // If SELLER, validate seller fields
            if ("SELLER".equalsIgnoreCase(request.getRole())) {
                validateSellerFields(request.getBusinessName(), request.getGstNumber());
            }

            User newUser = User.builder()
                    .firebaseUid(uid)
                    .email(email)
                    .fullName(request != null ? request.getFullName() : null)
                    .phone(request != null ? request.getPhone() : null)
                    .status(UserStatus.ACTIVE)
                    .build();

            return userRepository.save(newUser);
        });

        // If this is a new user (no roles) and request body provided, assign role and create seller if needed
        if ((user.getRoles() == null || user.getRoles().isEmpty()) && request != null) {
            // Assign role
            Role role = roleRepository.findByName(request.getRole())
                    .orElseThrow(() ->
                            new AuthException("INVALID_ROLE", "Invalid role selected.")
                    );

            UserRole userRole = new UserRole(user, role);
            userRoleRepository.save(userRole);

            // If SELLER, create seller record
            if ("SELLER".equalsIgnoreCase(request.getRole())) {
                // avoid creating duplicate seller
                if (!sellerRepository.existsByUserId(user.getId())) {
                    Seller seller = Seller.builder()
                            .user(user)
                            .businessName(request.getBusinessName())
                            .gstNumber(request.getGstNumber())
                            .status(SellerStatus.PENDING)
                            .build();

                    sellerRepository.save(seller);
                }
            }
        }

        String jwt = jwtUtil.generateToken(user);

        return buildResponse(user, jwt);
    }

    /* =========================
       RESPONSE BUILDER
    ========================== */
    private AuthResponse buildResponse(User user, String token) {

        List<String> roles = user.getRoles()
                .stream()
                .map(Role::getName)
                .toList();

        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                roles,
                token
        );
    }

    /* =========================
       VALIDATION HELPERS
    ========================== */
    private void validateRole(String role) throws AuthException {
        if (role == null || role.trim().isEmpty()) {
            throw new AuthException("INVALID_ROLE", "Role cannot be empty");
        }

        if ("ADMIN".equalsIgnoreCase(role)) {
            throw new AuthException("INVALID_ROLE", "Cannot self-assign ADMIN role");
        }

        Role existingRole = roleRepository.findByName(role)
                .orElseThrow(() ->
                        new AuthException("INVALID_ROLE", "Role does not exist")
                );
    }

    private void validateSellerFields(RegisterRequest request) throws AuthException {
        validateSellerFields(request.getBusinessName(), request.getGstNumber());
    }

    private void validateSellerFields(String businessName, String gstNumber) throws AuthException {
        if (businessName == null || businessName.trim().isEmpty()) {
            throw new AuthException("INVALID_SELLER_DATA", "Business name is required for seller registration");
        }

        if (businessName.length() > 255) {
            throw new AuthException("INVALID_SELLER_DATA", "Business name cannot exceed 255 characters");
        }

        if (gstNumber != null && !gstNumber.trim().isEmpty()) {
            if (!gstNumber.matches("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$")) {
                throw new AuthException("INVALID_SELLER_DATA", "Invalid GST number format");
            }
        }
    }

    /* =========================
       HELPER: Check if request is a registration request
    ========================== */
    private boolean isRegistrationRequest(FirebaseLoginRequest request) {
        // If no request body, it's a login
        if (request == null) {
            return false;
        }

        // If request body exists but has no meaningful data (all fields null/empty),
        // treat it as a login request (empty JSON body case)
        return request.getRole() != null && !request.getRole().trim().isEmpty();
    }
}
