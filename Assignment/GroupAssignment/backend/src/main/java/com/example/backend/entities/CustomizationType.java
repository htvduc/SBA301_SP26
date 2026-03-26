package com.example.backend.entities;

public enum CustomizationType {
    ADDON,      // Có thể chọn nhiều, có quantity (trân châu, topping, thạch...)
    VARIANT     // Chỉ chọn 1, không có quantity (size M/L/XL, đá/nóng, ít đường/nhiều đường...)
}
