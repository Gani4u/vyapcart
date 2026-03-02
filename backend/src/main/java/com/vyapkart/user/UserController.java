package com.vyapkart.user;

import com.vyapkart.user.dto.UserResponse;
import com.vyapkart.user.entity.Role;
import com.vyapkart.user.entity.User;
import com.vyapkart.user.repository.UserRepository;
import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.repository.SellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    public UserController(
            UserRepository userRepository,
            SellerRepository sellerRepository
    ) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
    }

    /**
     * Get current authenticated user info
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest().body("User not authenticated");
            }

            // Get the userId from the security context (set by JwtAuthenticationFilter)
            String userIdStr = authentication.getName();
            Long userId = Long.parseLong(userIdStr);
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            
            // Get list of roles
            List<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList());

            // Check if user is a seller and get seller status
            String sellerStatus = null;
            Optional<Seller> sellerOpt = sellerRepository.findByUserId(user.getId());
            if (sellerOpt.isPresent()) {
                sellerStatus = sellerOpt.get().getStatus().name();
            }

            UserResponse response = UserResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .roles(roleNames)
                    .sellerStatus(sellerStatus)
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error fetching user info: " + e.getMessage());
        }
    }
}
