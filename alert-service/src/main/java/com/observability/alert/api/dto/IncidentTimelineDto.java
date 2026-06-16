package com.observability.alert.api.dto;

import com.observability.alert.domain.IncidentTimelineEntry;

import java.time.OffsetDateTime;
import java.util.UUID;

public record IncidentTimelineDto(
        UUID id,
        UUID incidentId,
        String eventType,
        String message,
        String actor,
        OffsetDateTime createdAt
) {
    public static IncidentTimelineDto from(IncidentTimelineEntry entry) {
        return new IncidentTimelineDto(
                entry.getId(),
                entry.getIncidentId(),
                entry.getEventType(),
                entry.getMessage(),
                entry.getActor(),
                entry.getCreatedAt()
        );
    }
}
