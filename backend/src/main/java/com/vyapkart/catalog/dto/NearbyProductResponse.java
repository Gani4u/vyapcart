package com.vyapkart.catalog.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearbyProductResponse {

    private Long productId;
    private String name;
    private String businessName;
    private BigDecimal price;
    private Double distance;
}
