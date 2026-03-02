package com.vyapkart.catalog.repository;

import com.vyapkart.catalog.entity.Product;
import com.vyapkart.seller.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query(value = "SELECT " +
            "p.id as productId, " +
            "p.name, " +
            "s.business_name as businessName, " +
            "sku.price, " +
            "s.delivery_radius_km, " +
            "(" +
            "  6371 * acos(" +
            "    cos(radians(:lat)) * cos(radians(s.latitude)) * " +
            "    cos(radians(s.longitude) - radians(:lng)) + " +
            "    sin(radians(:lat)) * sin(radians(s.latitude))" +
            "  )" +
            ") as distance " +
            "FROM products p " +
            "INNER JOIN sellers s ON p.seller_id = s.id " +
            "INNER JOIN skus sku ON p.id = sku.product_id " +
            "WHERE p.status = 'ACTIVE' " +
            "AND s.status = 'APPROVED' " +
            "AND s.latitude IS NOT NULL " +
            "AND s.longitude IS NOT NULL " +
            "HAVING distance <= :radius AND distance <= s.delivery_radius_km " +
            "ORDER BY distance ASC", nativeQuery = true)
    List<Object[]> findNearbyProducts(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("radius") Integer radius
    );

    /**
     * Find all products for a specific seller
     */
    List<Product> findBySeller(Seller seller);
}

