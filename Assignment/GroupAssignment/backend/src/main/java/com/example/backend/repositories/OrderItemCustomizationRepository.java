package com.example.backend.repositories;

import com.example.backend.entities.OrderItemCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderItemCustomizationRepository extends JpaRepository<OrderItemCustomization, UUID> {
}
