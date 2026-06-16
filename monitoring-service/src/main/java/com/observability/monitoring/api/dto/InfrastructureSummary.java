package com.observability.monitoring.api.dto;

public record InfrastructureSummary(
        int totalHosts,
        int availableHosts,
        double averageCpu,
        double averageMemory,
        double averageDisk,
        int criticalHosts,
        int warningHosts
) {
}
