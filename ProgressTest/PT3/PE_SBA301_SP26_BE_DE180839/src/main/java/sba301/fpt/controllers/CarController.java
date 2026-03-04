package sba301.fpt.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import sba301.fpt.dtos.CarDTO;
import sba301.fpt.services.CarService;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cars")
public class CarController {
    @Autowired
    private CarService carService;

    @Autowired
    private sba301.fpt.repositories.CountryRepository countryRepository;

    @GetMapping("/countries")
    public ResponseEntity<?> getAllCountries() {
        return ResponseEntity.ok(countryRepository.findAll());
    }

    @GetMapping
    public ResponseEntity<List<CarDTO>> getAllCars() {
        return ResponseEntity.ok(carService.getAllCars());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarDTO> getCarById(@PathVariable Integer id) {
        return ResponseEntity.ok(carService.getCarById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_1')") // Assuming Role 1 is Admin
    public ResponseEntity<?> addCar(@Valid @RequestBody CarDTO carDTO) {
        try {
            return ResponseEntity.ok(carService.addCar(carDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_1')") // Assuming Role 1 is Admin
    public ResponseEntity<?> updateCar(@PathVariable Integer id, @Valid @RequestBody CarDTO carDTO) {
        try {
            return ResponseEntity.ok(carService.updateCar(id, carDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_1')") // Assuming Role 1 is Admin
    public ResponseEntity<?> deleteCar(@PathVariable Integer id) {
        try {
            carService.deleteCar(id);
            return ResponseEntity.ok("Car deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
