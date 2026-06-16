package com.observability.monitoring.api.dto;

public record TraceSpanDto(
        String traceId,
        String spanId,
        String serviceName,
        String operation,
        long durationMs,
        boolean error
) {
}
