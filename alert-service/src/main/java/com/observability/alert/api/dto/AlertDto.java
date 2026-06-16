package com.observability.alert.api.dto;

import com.observability.alert.domain.Alert;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlertDto(
        UUID id,
        String ruleName,
        String target,
        String metricName,
        double observedValue,
        double threshold,
        String severity,
        String status,
        String message,
        OffsetDateTime createdAt,
        OffsetDateTime acknowledgedAt,
        OffsetDateTime resolvedAt
) {
    public static AlertDto from(Alert alert) {
        return new AlertDto(
                alert.getId(),
                alert.getRuleName(),
                alert.getTarget(),
                alert.getMetricName(),
                alert.getObservedValue(),
                alert.getThreshold(),
                alert.getSeverity().name(),
                alert.getStatus().name(),
                alert.getMessage(),
                alert.getCreatedAt(),
                alert.getAcknowledgedAt(),
                alert.getResolvedAt()
        );
    }
}
