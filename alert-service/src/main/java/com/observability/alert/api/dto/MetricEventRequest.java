package com.observability.alert.api.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.OffsetDateTime;

public record MetricEventRequest(
        @NotBlank String target,
        @NotBlank String metricName,
        double value,
        OffsetDateTime observedAt
) {
}
