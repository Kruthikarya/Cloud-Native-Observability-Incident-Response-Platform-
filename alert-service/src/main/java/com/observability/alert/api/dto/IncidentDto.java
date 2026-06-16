package com.observability.alert.api.dto;

import com.observability.alert.domain.Incident;

import java.time.OffsetDateTime;
import java.util.UUID;

public record IncidentDto(
        UUID id,
        UUID alertId,
        String title,
        String severity,
        String status,
        String assignedTo,
        String rootCause,
        String resolution,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        OffsetDateTime resolvedAt
) {
    public static IncidentDto from(Incident incident) {
        return new IncidentDto(
                incident.getId(),
                incident.getAlertId(),
                incident.getTitle(),
                incident.getSeverity().name(),
                incident.getStatus().name(),
                incident.getAssignedTo(),
                incident.getRootCause(),
                incident.getResolution(),
                incident.getCreatedAt(),
                incident.getUpdatedAt(),
                incident.getResolvedAt()
        );
    }
}
