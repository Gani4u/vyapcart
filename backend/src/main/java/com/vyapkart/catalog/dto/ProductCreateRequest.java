package com.vyapkart.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotEmpty(message = "At least one SKU is required")
    @Valid
    private List<SKURequest> skus;
}
