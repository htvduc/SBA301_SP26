package sba301.fpt.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.fpt.pojos.Car;

public interface CarRepository extends JpaRepository<Car, Integer> {
}
