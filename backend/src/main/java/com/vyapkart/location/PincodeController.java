package com.vyapkart.location;

import com.vyapkart.location.dto.PincodeResponse;
import com.vyapkart.location.service.PincodeService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pincode")
@AllArgsConstructor
public class PincodeController {

    private final PincodeService pincodeService;

    /**
     * Get pincode details by pincode code
     * Returns city, state, latitude, longitude
     */
    @GetMapping("/{code}")
    public ResponseEntity<?> getPincodeDetails(@PathVariable String code) {
        PincodeResponse response = pincodeService.getPincodeByCode(code);
        return ResponseEntity.ok(response);
    }
}
