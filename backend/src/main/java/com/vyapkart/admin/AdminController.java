package com.vyapkart.admin;

import com.vyapkart.seller.entity.Seller;
import com.vyapkart.seller.entity.SellerStatus;
import com.vyapkart.seller.repository.SellerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final SellerRepository sellerRepository;

    public AdminController(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    /**
     * Get all sellers with PENDING status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/sellers/pending")
    public ResponseEntity<?> getPendingSellers() {
        List<Seller> pendingSellers = sellerRepository.findByStatus(SellerStatus.PENDING);
        
        Map<String, Object> response = new HashMap<>();
        response.put("sellers", pendingSellers);
        response.put("count", pendingSellers.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Approve a seller by ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sellers/{sellerId}/approve")
    public ResponseEntity<?> approveSeller(
            @PathVariable Long sellerId
    ) {
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Seller seller = sellerOpt.get();
        seller.setStatus(SellerStatus.APPROVED);
        Seller updatedSeller = sellerRepository.save(seller);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seller approved successfully");
        response.put("sellerId", updatedSeller.getId());
        response.put("sellerName", updatedSeller.getBusinessName());
        response.put("status", updatedSeller.getStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * Reject a seller by ID
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/sellers/{sellerId}/reject")
    public ResponseEntity<?> rejectSeller(
            @PathVariable Long sellerId,
            @RequestBody(required = false) Map<String, String> requestBody
    ) {
        Optional<Seller> sellerOpt = sellerRepository.findById(sellerId);
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Seller seller = sellerOpt.get();
        seller.setStatus(SellerStatus.REJECTED);
        
        if (requestBody != null && requestBody.containsKey("reason")) {
            seller.setRejectedReason(requestBody.get("reason"));
        }

        Seller updatedSeller = sellerRepository.save(seller);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seller rejected");
        response.put("sellerId", updatedSeller.getId());
        response.put("sellerName", updatedSeller.getBusinessName());
        response.put("status", updatedSeller.getStatus());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all sellers
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/sellers")
    public ResponseEntity<?> getAllSellers() {
        List<Seller> sellers = sellerRepository.findAll();
        
        Map<String, Object> response = new HashMap<>();
        response.put("sellers", sellers);
        response.put("count", sellers.size());
        
        return ResponseEntity.ok(response);
    }
}
