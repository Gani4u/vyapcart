package com.vyapkart.location.service;

import com.vyapkart.exception.ResourceNotFoundException;
import com.vyapkart.exception.ValidationException;
import com.vyapkart.location.dto.PincodeResponse;
import com.vyapkart.location.entity.Pincode;
import com.vyapkart.location.repository.PincodeRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PincodeService {

    private final PincodeRepository pincodeRepository;

    private static final String PINCODE_REGEX = "^[0-9]{6}$";

    public PincodeResponse getPincodeByCode(String code) {
        // Validate pincode format
        if (!code.matches(PINCODE_REGEX)) {
            throw new ValidationException(
                    "INVALID_PINCODE_FORMAT",
                    "Pincode must be exactly 6 digits"
            );
        }

        Pincode pincode = pincodeRepository.findByPincode(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "PINCODE_NOT_FOUND",
                        "Pincode not found: " + code
                ));

        return convertToResponse(pincode);
    }

    private PincodeResponse convertToResponse(Pincode pincode) {
        return PincodeResponse.builder()
                .pincode(pincode.getPincode())
                .city(pincode.getCity())
                .state(pincode.getState())
                .latitude(pincode.getLatitude())
                .longitude(pincode.getLongitude())
                .build();
    }
}
