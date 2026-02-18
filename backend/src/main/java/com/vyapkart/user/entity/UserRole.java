package com.vyapkart.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRole {

    public UserRole(User user, Role role) {
    this.id = new UserRoleId(user.getId(), role.getId());
    this.user = user;
    this.role = role;
    }

    @EmbeddedId
    private UserRoleId id;

    @ManyToOne
    @MapsId("userId")
    private User user;

    @ManyToOne
    @MapsId("roleId")
    private Role role;
}
