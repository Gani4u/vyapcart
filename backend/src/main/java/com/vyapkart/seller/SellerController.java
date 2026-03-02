package com.vyapkart.seller;

import com.vyapkart.catalog.dto.ProductCreateRequest;
import com.vyapkart.catalog.dto.ProductResponse;
import com.vyapkart.catalog.service.ProductService;
import com.vyapkart.seller.dto.SellerLocationRequest;
import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.service.SellerLocationService;
import com.vyapkart.user.entity.User;
import com.vyapkart.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/seller")
@AllArgsConstructor
public class SellerController {

    private final SellerLocationService sellerLocationService;
    private final ProductService productService;
    private final UserRepository userRepository;

    /**
     * Update seller location, delivery radius
     * Only SELLER role can access
     */
    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/location")
    public ResponseEntity<?> updateSellerLocation(
            @Valid @RequestBody SellerLocationRequest request
    ) {
        // Get authenticated user from security context
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller updatedSeller = sellerLocationService.updateSellerLocation(user, request);

        return ResponseEntity.ok(buildLocationResponse(updatedSeller));
    }

    /**
     * Get seller location
     */
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/location")
    public ResponseEntity<?> getSellerLocation() {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        return ResponseEntity.ok(buildLocationResponse(seller));
    }

    /**
     * Create a new product with SKUs
     */
    @PreAuthorize("hasRole('SELLER')")
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductCreateRequest request
    ) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        ProductResponse product = productService.createProduct(seller, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(buildProductResponse(product));
    }

    /**
     * Get all products for the logged-in seller
     */
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/products")
    public ResponseEntity<?> getSellerProducts() {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        List<ProductResponse> products = productService.getSellerProducts(seller);

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("count", products.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific product by ID (seller only)
     */
    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProduct(
            @PathVariable Long productId
    ) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        ProductResponse product = productService.getProduct(productId, seller);

        return ResponseEntity.ok(buildProductResponse(product));
    }

    /**
     * Update a product
     */
    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/products/{productId}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductCreateRequest request
    ) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        ProductResponse product = productService.updateProduct(productId, seller, request);

        return ResponseEntity.ok(buildProductResponse(product));
    }

    /**
     * Delete a product
     */
    @PreAuthorize("hasRole('SELLER')")
    @DeleteMapping("/products/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long productId
    ) {
        String userId = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        User user = userRepository.findById(Long.parseLong(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerLocationService.getSellerLocation(user);

        productService.deleteProduct(productId, seller);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Product deleted successfully");

        return ResponseEntity.ok(response);
    }

    // ============ HELPER METHODS ============

    private Map<String, Object> buildLocationResponse(Seller seller) {
        Map<String, Object> response = new HashMap<>();
        response.put("sellerId", seller.getId());
        response.put("businessName", seller.getBusinessName());
        response.put("latitude", seller.getLatitude());
        response.put("longitude", seller.getLongitude());
        response.put("deliveryRadiusKm", seller.getDeliveryRadiusKm());
        response.put("status", seller.getStatus().toString());
        return response;
    }

    private Map<String, Object> buildProductResponse(ProductResponse product) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", product);
        return response;
    }
}
