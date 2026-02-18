package com.vyapkart.seller.repository;

import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.entity.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByUserId(Long userId);

    List<Seller> findByStatus(SellerStatus status);

    boolean existsByUserId(Long userId);
}
