package com.vyapkart.catalog;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    @GetMapping("/products")
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
