package com.observability.monitoring.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record MetricIngestRequest(
        @NotBlank String hostName,
        @NotBlank String environment,
        @Min(0) @Max(100) double cpuUsage,
        @Min(0) @Max(100) double memoryUsage,
        @Min(0) @Max(100) double diskUsage,
        @Min(0) double networkInMbps,
        @Min(0) double networkOutMbps,
        @Min(0) long uptimeSeconds,
        @Min(0) int processCount,
        boolean available
) {
}
