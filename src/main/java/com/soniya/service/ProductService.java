package com.soniya.service;

import com.soniya.dto.ProductRequest;
import com.soniya.entity.Product;
import com.soniya.exception.ResourceNotFoundException;
import com.soniya.repository.ProductRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =========================
    // Create Product
    // =========================

    public Product createProduct(ProductRequest request) {

        validateProduct(request);

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setMinNegotiablePrice(
                request.getMinNegotiablePrice()
        );
        product.setStock(request.getStock());

        // Stock available → active
        product.setActive(request.getStock() > 0);

        return productRepository.save(product);
    }

    // =========================
    // Get All Active Products
    // =========================

    public List<Product> getAllProducts() {

        return productRepository.findByActiveTrue();
    }

    // =========================
    // Get Product By ID
    // =========================

    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        )
                );
    }

    // =========================
    // Get Products By Category
    // =========================

    public List<Product> getProductsByCategory(String category) {

        return productRepository.findByCategory(category);
    }

    // =========================
    // Update Product
    // =========================

    public Product updateProduct(
            Long id,
            ProductRequest request) {

        validateProduct(request);

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setMinNegotiablePrice(
                request.getMinNegotiablePrice()
        );
        product.setStock(request.getStock());

        // Automatically update active status
        product.setActive(request.getStock() > 0);

        return productRepository.save(product);
    }

    // =========================
    // Delete Product
    // =========================

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " + id
                        )
                );

        productRepository.delete(product);
    }

    // =========================
    // Product Business Validation
    // =========================

    private void validateProduct(ProductRequest request) {

        if (request.getMinNegotiablePrice()
                > request.getPrice()) {

            throw new IllegalArgumentException(
                    "Minimum negotiable price cannot be greater than product price"
            );
        }
    }
}