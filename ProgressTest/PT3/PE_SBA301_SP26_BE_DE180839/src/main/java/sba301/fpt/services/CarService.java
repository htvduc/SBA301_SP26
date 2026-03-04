package sba301.fpt.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import sba301.fpt.dtos.CarDTO;
import sba301.fpt.pojos.Car;
import sba301.fpt.pojos.Country;
import sba301.fpt.repositories.CarRepository;
import sba301.fpt.repositories.CountryRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CarService {
    @Autowired
    private CarRepository carRepository;

    @Autowired
    private CountryRepository countryRepository;

    public List<CarDTO> getAllCars() {
        return carRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CarDTO addCar(CarDTO carDTO) {
        Country country = countryRepository.findById(carDTO.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found"));

        Car car = new Car();
        car.setCarName(carDTO.getCarName());
        car.setCountry(country);
        car.setUnitsInStock(carDTO.getUnitsInStock());
        car.setUnitPrice(carDTO.getUnitPrice());

        // Requirements: CreatedAt = CurrentDate and CreatedAt <= UpdatedAt
        // CreationTimestamp and UpdateTimestamp in Entity handle this mostly,
        // but we can set them explicitly if needed for the "CurrentDate" requirement.
        LocalDateTime now = LocalDateTime.now();
        car.setCreatedAt(now);
        car.setUpdatedAt(now);

        Car savedCar = carRepository.save(car);
        return convertToDTO(savedCar);
    }

    public void deleteCar(Integer id) {
        if (!carRepository.existsById(id)) {
            throw new RuntimeException("Car not found");
        }
        carRepository.deleteById(id);
    }

    public CarDTO getCarById(Integer id) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        return convertToDTO(car);
    }

    public CarDTO updateCar(Integer id, CarDTO carDTO) {
        Car car = carRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Car not found"));

        Country country = countryRepository.findById(carDTO.getCountryId())
                .orElseThrow(() -> new RuntimeException("Country not found"));

        car.setCarName(carDTO.getCarName());
        car.setCountry(country);
        car.setUnitsInStock(carDTO.getUnitsInStock());
        car.setUnitPrice(carDTO.getUnitPrice());
        car.setUpdatedAt(LocalDateTime.now());

        Car savedCar = carRepository.save(car);
        return convertToDTO(savedCar);
    }

    private CarDTO convertToDTO(Car car) {
        CarDTO dto = new CarDTO();
        dto.setCarId(car.getCarId());
        dto.setCarName(car.getCarName());
        dto.setCountryId(car.getCountry().getCountryId());
        dto.setCountryName(car.getCountry().getCountryName());
        dto.setUnitsInStock(car.getUnitsInStock());
        dto.setUnitPrice(car.getUnitPrice());
        dto.setCreatedAt(car.getCreatedAt());
        dto.setUpdatedAt(car.getUpdatedAt());
        return dto;
    }
}
