package com.soniya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private Boolean defaultAddress;
}