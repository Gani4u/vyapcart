package com.vyapkart.catalog;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

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
}
