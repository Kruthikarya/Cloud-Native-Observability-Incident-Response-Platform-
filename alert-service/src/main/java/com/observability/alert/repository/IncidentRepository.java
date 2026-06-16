package com.observability.alert.repository;

import com.observability.alert.domain.Incident;
import com.observability.alert.domain.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    List<Incident> findTop200ByOrderByCreatedAtDesc();

    long countByStatus(IncidentStatus status);
}
