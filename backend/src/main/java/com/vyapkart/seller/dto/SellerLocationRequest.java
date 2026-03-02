package com.vyapkart.seller.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerLocationRequest {

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @NotNull(message = "Delivery radius is required")
    @Positive(message = "Delivery radius must be greater than 0")
    @Max(value = 100, message = "Delivery radius cannot exceed 100 km")
    private Integer deliveryRadiusKm;
}
