package com.observability.monitoring.api.dto;

import com.observability.monitoring.domain.InfrastructureMetric;

import java.time.OffsetDateTime;

public record HostMetricDto(
        String hostName,
        String environment,
        double cpuUsage,
        double memoryUsage,
        double diskUsage,
        double networkInMbps,
        double networkOutMbps,
        long uptimeSeconds,
        int processCount,
        boolean available,
        String source,
        OffsetDateTime collectedAt
) {
    public static HostMetricDto from(InfrastructureMetric metric) {
        return new HostMetricDto(
                metric.getHostName(),
                metric.getEnvironment(),
                metric.getCpuUsage(),
                metric.getMemoryUsage(),
                metric.getDiskUsage(),
                metric.getNetworkInMbps(),
                metric.getNetworkOutMbps(),
                metric.getUptimeSeconds(),
                metric.getProcessCount(),
                metric.isAvailable(),
                metric.getSource().name(),
                metric.getCollectedAt()
        );
    }
}
