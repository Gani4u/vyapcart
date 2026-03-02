package com.vyapkart.catalog.service;

import com.vyapkart.catalog.dto.*;
import com.vyapkart.catalog.entity.Product;
import com.vyapkart.catalog.entity.ProductStatus;
import com.vyapkart.catalog.entity.SKU;
import com.vyapkart.catalog.repository.ProductRepository;
import com.vyapkart.catalog.repository.SKURepository;
import com.vyapkart.exception.ValidationException;
import com.vyapkart.seller.entity.Seller;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SKURepository skuRepository;

    // ============ BUYER OPERATIONS ============

    public List<NearbyProductResponse> findNearbyProducts(Double latitude, Double longitude, Integer radius) {
        // Validate coordinates
        validateCoordinates(latitude, longitude);
        validateRadius(radius);

        // Query nearby products using Haversine formula
        List<Object[]> results = productRepository.findNearbyProducts(latitude, longitude, radius);

        // Convert results to DTOs
        return results.stream()
                .map(this::convertToNearbyProductResponse)
                .collect(Collectors.toList());
    }

    // ============ SELLER OPERATIONS ============

    @Transactional
    public ProductResponse createProduct(Seller seller, ProductCreateRequest request) {
        // Validate input
        if (request.getSkus() == null || request.getSkus().isEmpty()) {
            throw new ValidationException(
                    "INVALID_SKUS",
                    "Product must have at least one SKU"
            );
        }

        // Create product
        Product product = Product.builder()
                .seller(seller)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .status(ProductStatus.ACTIVE)
                .build();

        // Save product
        product = productRepository.save(product);

        // Create SKUs
        for (SKURequest skuRequest : request.getSkus()) {
            SKU sku = SKU.builder()
                    .product(product)
                    .skuCode(skuRequest.getSkuCode().trim().toUpperCase())
                    .price(skuRequest.getPrice())
                    .build();
            skuRepository.save(sku);
        }

        // Refresh to get all SKUs
        product = productRepository.findById(product.getId()).orElseThrow();

        return convertToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getSellerProducts(Seller seller) {
        List<Product> products = productRepository.findBySeller(seller);
        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponse getProduct(Long productId, Seller seller) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationException(
                        "PRODUCT_NOT_FOUND",
                        "Product not found"
                ));

        // Verify ownership
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ValidationException(
                    "UNAUTHORIZED",
                    "You don't have permission to access this product"
            );
        }

        return convertToProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long productId, Seller seller, ProductCreateRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationException(
                        "PRODUCT_NOT_FOUND",
                        "Product not found"
                ));

        // Verify ownership
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ValidationException(
                    "UNAUTHORIZED",
                    "You don't have permission to update this product"
            );
        }

        // Update basic info
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");

        // Remove old SKUs
        skuRepository.deleteAll(product.getSkus());
        product.getSkus().clear();

        // Add new SKUs
        for (SKURequest skuRequest : request.getSkus()) {
            SKU sku = SKU.builder()
                    .product(product)
                    .skuCode(skuRequest.getSkuCode().trim().toUpperCase())
                    .price(skuRequest.getPrice())
                    .build();
            product.getSkus().add(sku);
        }

        product = productRepository.save(product);

        return convertToProductResponse(product);
    }

    @Transactional
    public void deleteProduct(Long productId, Seller seller) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationException(
                        "PRODUCT_NOT_FOUND",
                        "Product not found"
                ));

        // Verify ownership
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new ValidationException(
                    "UNAUTHORIZED",
                    "You don't have permission to delete this product"
            );
        }

        productRepository.delete(product);
    }

    // ============ HELPER METHODS ============

    private void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new ValidationException(
                    "INVALID_COORDINATES",
                    "Latitude and longitude are required"
            );
        }

        if (latitude < -90 || latitude > 90) {
            throw new ValidationException(
                    "INVALID_LATITUDE",
                    "Latitude must be between -90 and 90"
            );
        }

        if (longitude < -180 || longitude > 180) {
            throw new ValidationException(
                    "INVALID_LONGITUDE",
                    "Longitude must be between -180 and 180"
            );
        }
    }

    private void validateRadius(Integer radius) {
        if (radius == null || radius <= 0) {
            throw new ValidationException(
                    "INVALID_RADIUS",
                    "Radius must be greater than 0"
            );
        }

        if (radius > 100) {
            throw new ValidationException(
                    "RADIUS_TOO_LARGE",
                    "Radius cannot exceed 100 km"
            );
        }
    }

    private NearbyProductResponse convertToNearbyProductResponse(Object[] row) {
        return NearbyProductResponse.builder()
                .productId(((Number) row[0]).longValue())
                .name((String) row[1])
                .businessName((String) row[2])
                .price((BigDecimal) row[3])
                .distance(((Number) row[4]).doubleValue())
                .build();
    }

    private ProductResponse convertToProductResponse(Product product) {
        List<SKUResponse> skuResponses = product.getSkus() != null
                ? product.getSkus().stream()
                .map(sku -> SKUResponse.builder()
                        .id(sku.getId())
                        .skuCode(sku.getSkuCode())
                        .price(sku.getPrice())
                        .build())
                .collect(Collectors.toList())
                : List.of();

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .status(product.getStatus().toString())
                .createdAt(product.getCreatedAt())
                .skus(skuResponses)
                .build();
    }
}

