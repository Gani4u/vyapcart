package com.vyapkart.catalog.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SKUResponse {

    private Long id;
    private String skuCode;
    private BigDecimal price;
}
