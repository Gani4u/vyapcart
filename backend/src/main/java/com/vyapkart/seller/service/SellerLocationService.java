package com.vyapkart.seller.service;

import com.vyapkart.exception.ResourceNotFoundException;
import com.vyapkart.seller.dto.SellerLocationRequest;
import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.repository.SellerRepository;
import com.vyapkart.user.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@AllArgsConstructor
public class SellerLocationService {

    private final SellerRepository sellerRepository;

    @Transactional
    public Seller updateSellerLocation(User user, SellerLocationRequest request) {
        Seller seller = sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SELLER_NOT_FOUND",
                        "Seller profile not found for user: " + user.getId()
                ));

        seller.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        seller.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        seller.setDeliveryRadiusKm(request.getDeliveryRadiusKm());

        return sellerRepository.save(seller);
    }

    public Seller getSellerLocation(User user) {
        return sellerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SELLER_NOT_FOUND",
                        "Seller profile not found for user: " + user.getId()
                ));
    }
}
