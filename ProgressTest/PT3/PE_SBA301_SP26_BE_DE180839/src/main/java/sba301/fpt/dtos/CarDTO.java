package sba301.fpt.dtos;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class CarDTO {
    private Integer carId;

    @NotBlank(message = "CarName is required")
    @Size(min = 11, message = "CarName must be greater than 10 characters")
    private String carName;

    @NotNull(message = "CountryID is required")
    private Integer countryId;

    private String countryName;

    @NotNull(message = "UnitsInStock is required")
    @Min(value = 5, message = "UnitsInStock must be at least 5")
    @Max(value = 20, message = "UnitsInStock must be at most 20")
    private Short unitsInStock;

    @NotNull(message = "UnitPrice is required")
    private Integer unitPrice;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CarDTO() {
    }

    public CarDTO(Integer carId, String carName, Integer countryId, String countryName, Short unitsInStock,
            Integer unitPrice, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.carId = carId;
        this.carName = carName;
        this.countryId = countryId;
        this.countryName = countryName;
        this.unitsInStock = unitsInStock;
        this.unitPrice = unitPrice;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getCarId() {
        return carId;
    }

    public void setCarId(Integer carId) {
        this.carId = carId;
    }

    public String getCarName() {
        return carName;
    }

    public void setCarName(String carName) {
        this.carName = carName;
    }

    public Integer getCountryId() {
        return countryId;
    }

    public void setCountryId(Integer countryId) {
        this.countryId = countryId;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public Short getUnitsInStock() {
        return unitsInStock;
    }

    public void setUnitsInStock(Short unitsInStock) {
        this.unitsInStock = unitsInStock;
    }

    public Integer getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(Integer unitPrice) {
        this.unitPrice = unitPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
