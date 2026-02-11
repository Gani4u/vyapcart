package com.vyapkart.user.repository;

import com.vyapkart.user.entity.UserRole;
import com.vyapkart.user.entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository
        extends JpaRepository<UserRole, UserRoleId> {
}
