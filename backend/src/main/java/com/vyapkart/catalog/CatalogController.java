package com.vyapkart.catalog;

import com.vyapkart.catalog.dto.NearbyProductResponse;
import com.vyapkart.catalog.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog")
@AllArgsConstructor
public class CatalogController {

    private final ProductService productService;

    @GetMapping("/products")
    @PreAuthorize("hasRole('BUYER')")
    public List<String> getProducts() {
        return List.of(
                "Apple",
                "Milk",
                "Bread",
                "Rice",
                "Sugar"
        );
    }

    /**
     * Find nearby products within specified radius
     * Uses Haversine formula to calculate distance from seller location
     * Only BUYER role can access
     */
    @GetMapping("/products/nearby")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<?> findNearbyProducts(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam Integer radius
    ) {
        List<NearbyProductResponse> products = productService.findNearbyProducts(lat, lng, radius);
        return ResponseEntity.ok(products);
    }
}
