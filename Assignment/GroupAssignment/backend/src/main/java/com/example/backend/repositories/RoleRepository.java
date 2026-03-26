package com.example.backend.repositories;

import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    /**
     * Find role by name
     * @param name Role name enum
     * @return Optional Role
     */
    Optional<Role> findByName(RoleName name);
}
