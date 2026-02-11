package com.vyapkart.user.service;

import com.vyapkart.user.entity.*;
import com.vyapkart.user.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserRoleRepository userRoleRepository
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
    }

    @Transactional
    public User getOrCreateUser(String firebaseUid, String email) {

        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseGet(() -> {

                    User user = User.builder()
                            .firebaseUid(firebaseUid)
                            .email(email)
                            .status("ACTIVE")
                            .build();

                    userRepository.save(user);

                    Role buyerRole = roleRepository.findByName("BUYER")
                            .orElseThrow(() ->
                                    new RuntimeException("BUYER role not found"));

                    UserRole userRole = UserRole.builder()
                            .id(new UserRoleId(user.getId(), buyerRole.getId()))
                            .user(user)
                            .role(buyerRole)
                            .build();

                    userRoleRepository.save(userRole);

                    return user;
                });
    }
}
