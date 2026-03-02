package fpt.sba301.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "room_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_typeid")
    private Integer roomTypeID;

    @Column(name = "room_type_name")
    private String roomTypeName;

    @Column(name = "type_description")
    private String typeDescription;

    @Column(name = "type_note")
    private String typeNote;

    @OneToMany(mappedBy = "roomType")
    @JsonIgnore
    private List<RoomInformation> rooms;
}