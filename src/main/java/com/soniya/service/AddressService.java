package com.soniya.service;

import com.soniya.dto.AddressRequest;
import com.soniya.entity.Address;
import com.soniya.repository.AddressRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public Address createAddress(Long userId, AddressRequest request) {

        // If this address is marked as default,
        // remove default status from existing default address
        if (Boolean.TRUE.equals(request.getDefaultAddress())) {
            addressRepository.findByUserIdAndDefaultAddressTrue(userId)
                    .ifPresent(existing -> {
                        existing.setDefaultAddress(false);
                        addressRepository.save(existing);
                    });
        }

        Address address = new Address();

        address.setUserId(userId);
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        address.setDefaultAddress(
                Boolean.TRUE.equals(request.getDefaultAddress())
        );

        return addressRepository.save(address);
    }

    public List<Address> getMyAddresses(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    public Address getAddress(Long userId, Long addressId) {

        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Address not found"));
    }

    public Address updateAddress(
            Long userId,
            Long addressId,
            AddressRequest request) {

        Address address = getAddress(userId, addressId);

        if (Boolean.TRUE.equals(request.getDefaultAddress())) {
            addressRepository.findByUserIdAndDefaultAddressTrue(userId)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(addressId)) {
                            existing.setDefaultAddress(false);
                            addressRepository.save(existing);
                        }
                    });
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setLandmark(request.getLandmark());
        address.setDefaultAddress(
                Boolean.TRUE.equals(request.getDefaultAddress())
        );

        return addressRepository.save(address);
    }

    public void deleteAddress(Long userId, Long addressId) {

        Address address = getAddress(userId, addressId);

        addressRepository.delete(address);
    }
}