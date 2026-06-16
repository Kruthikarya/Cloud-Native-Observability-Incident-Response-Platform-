package com.observability.alert.repository;

import com.observability.alert.domain.Alert;
import com.observability.alert.domain.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findTop200ByOrderByCreatedAtDesc();

    long countByStatus(AlertStatus status);
}
