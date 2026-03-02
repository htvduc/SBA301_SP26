package fpt.sba301.controller;

import fpt.sba301.entity.RoomInformation;
import fpt.sba301.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff/rooms")
@RequiredArgsConstructor
public class StaffRoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomInformation> getAllRooms() {
        return roomService.getRoomsForStaff();
    }

    @GetMapping("/{id}")
    public RoomInformation getRoomById(@PathVariable Integer id) {
        return roomService.getById(id);
    }

    @PostMapping
    public RoomInformation createRoom(@RequestBody RoomInformation room) {
        return roomService.create(room);
    }

    @PutMapping("/{id}")
    public RoomInformation updateRoom(@PathVariable Integer id,
                                      @RequestBody RoomInformation room) {
        return roomService.update(id, room);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Integer id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

