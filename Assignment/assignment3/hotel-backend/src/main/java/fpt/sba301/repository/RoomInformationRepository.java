package fpt.sba301.repository;

import fpt.sba301.entity.RoomInformation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomInformationRepository extends JpaRepository<RoomInformation, Integer> {

    List<RoomInformation> findByRoomStatus(Integer status);
}
