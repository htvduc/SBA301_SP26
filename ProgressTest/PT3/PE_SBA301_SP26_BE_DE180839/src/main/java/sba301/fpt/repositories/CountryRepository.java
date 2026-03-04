package sba301.fpt.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.fpt.pojos.Country;

public interface CountryRepository extends JpaRepository<Country, Integer> {
}
