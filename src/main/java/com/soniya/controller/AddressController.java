package com.soniya.controller;

import com.soniya.dto.AddressRequest;
import com.soniya.entity.Address;
import com.soniya.entity.User;
import com.soniya.repository.UserRepository;
import com.soniya.service.AddressService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    private final UserRepository userRepository;

    public AddressController(
            AddressService addressService,
            UserRepository userRepository) {

        this.addressService = addressService;

        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE ADDRESS
    // =====================================================

    @PostMapping
    public ResponseEntity<Address> createAddress(
            @RequestBody AddressRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                addressService.createAddress(
                        userId,
                        request
                )
        );
    }

    // =====================================================
    // GET MY ADDRESSES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                addressService.getMyAddresses(userId)
        );
    }

    // =====================================================
    // GET MY ADDRESS BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddress(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                addressService.getAddress(
                        userId,
                        id
                )
        );
    }

    // =====================================================
    // UPDATE MY ADDRESS
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(
            @PathVariable Long id,
            @RequestBody AddressRequest request,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        return ResponseEntity.ok(
                addressService.updateAddress(
                        userId,
                        id,
                        request
                )
        );
    }

    // =====================================================
    // DELETE MY ADDRESS
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAddress(
            @PathVariable Long id,
            Authentication authentication) {

        Long userId = getUserId(authentication);

        addressService.deleteAddress(
                userId,
                id
        );

        return ResponseEntity.ok(
                "Address deleted successfully"
        );
    }

    // =====================================================
    // GET LOGGED-IN USER ID FROM JWT
    // =====================================================

    private Long getUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );

        return user.getId();
    }
}