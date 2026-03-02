package fpt.sba301.controller;

import fpt.sba301.entity.RoomInformation;
import fpt.sba301.entity.RoomType;
import fpt.sba301.repository.RoomTypeRepository;
import fpt.sba301.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomTypeRepository roomTypeRepository;

    @GetMapping
    public List<RoomInformation> getRooms(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate != null && endDate != null) {
            return roomService.getAvailableRooms(startDate, endDate);
        }
        return roomService.getAllRooms();
    }

    @GetMapping("/all-with-status")
    public List<RoomInformation> getAllRoomsWithStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkDate) {
        return roomService.getAllRoomsWithStatus(checkDate != null ? checkDate : LocalDate.now());
    }

    @GetMapping("/types")
    public List<RoomType> getRoomTypes() {
        return roomTypeRepository.findAll();
    }
}
