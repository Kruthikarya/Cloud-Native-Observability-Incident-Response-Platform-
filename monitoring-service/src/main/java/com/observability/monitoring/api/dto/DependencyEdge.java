package com.observability.monitoring.api.dto;

public record DependencyEdge(
        String source,
        String target,
        double p95LatencyMs,
        double errorRate,
        String traceId
) {
}
