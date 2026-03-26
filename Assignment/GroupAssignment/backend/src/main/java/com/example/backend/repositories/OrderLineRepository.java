package com.example.backend.repositories;

import com.example.backend.entities.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {

    List<OrderLine> findByOrder_OrderId(UUID orderId);

    @org.springframework.data.jpa.repository.Query("SELECT ol FROM OrderLine ol JOIN ol.order o JOIN o.areaTable t JOIN t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (ol.orderLineStatus = 'PENDING' OR ol.orderLineStatus = 'PREPARING') " +
           "ORDER BY ol.createdAt ASC")
    List<OrderLine> findCurrentOrderLinesByBranchId(@org.springframework.data.repository.query.Param("branchId") UUID branchId);
}
