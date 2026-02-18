package com.vyapkart.auth;

import java.util.List;

public class AuthResponse {

    private Long userId;
    private String email;
    private String fullName;
    private String phone;
    private List<String> roles;
    private String token;

    // ===== CONSTRUCTORS =====
    public AuthResponse() {
    }

    public AuthResponse(Long userId, String email, String fullName, String phone, List<String> roles, String token) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.roles = roles;
        this.token = token;
    }

    // ===== GETTERS & SETTERS =====
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
