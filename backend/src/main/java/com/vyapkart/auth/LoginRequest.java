package com.vyapkart.auth;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String idToken;

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
