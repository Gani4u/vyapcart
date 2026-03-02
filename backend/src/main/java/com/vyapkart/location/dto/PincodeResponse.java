package com.vyapkart.location.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PincodeResponse {

    private String pincode;
    private String city;
    private String state;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
