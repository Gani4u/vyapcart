package com.vyapkart.catalog.repository;

import com.vyapkart.catalog.entity.SKU;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SKURepository extends JpaRepository<SKU, Long> {

    Optional<SKU> findBySkuCode(String skuCode);
}
