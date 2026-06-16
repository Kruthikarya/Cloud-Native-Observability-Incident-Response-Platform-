package com.observability.alert.api.dto;

import com.observability.alert.domain.AlertRule;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AlertRuleDto(
        UUID id,
        String name,
        String metricName,
        String operator,
        double threshold,
        String severity,
        int evaluationWindowSeconds,
        boolean enabled,
        OffsetDateTime createdAt
) {
    public static AlertRuleDto from(AlertRule rule) {
        return new AlertRuleDto(
                rule.getId(),
                rule.getName(),
                rule.getMetricName(),
                rule.getOperator().name(),
                rule.getThreshold(),
                rule.getSeverity().name(),
                rule.getEvaluationWindowSeconds(),
                rule.isEnabled(),
                rule.getCreatedAt()
        );
    }
}
