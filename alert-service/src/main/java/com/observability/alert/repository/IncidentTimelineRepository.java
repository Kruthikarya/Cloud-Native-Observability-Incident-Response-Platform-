package com.observability.alert.repository;

import com.observability.alert.domain.IncidentTimelineEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentTimelineRepository extends JpaRepository<IncidentTimelineEntry, UUID> {

    List<IncidentTimelineEntry> findByIncidentIdOrderByCreatedAtAsc(UUID incidentId);
}
