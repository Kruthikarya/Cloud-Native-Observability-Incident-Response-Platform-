package com.observability.alert.api.dto;

public record AlertSummary(
        long activeAlerts,
        long acknowledgedAlerts,
        long resolvedAlerts,
        long openIncidents,
        long investigatingIncidents,
        long resolvedIncidents
) {
}
