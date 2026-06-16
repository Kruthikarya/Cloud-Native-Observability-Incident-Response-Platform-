package com.observability.alert.api.dto;

import com.observability.alert.domain.RuleOperator;
import com.observability.alert.domain.Severity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAlertRuleRequest(
        @NotBlank String name,
        @NotBlank String metricName,
        @NotNull RuleOperator operator,
        double threshold,
        @NotNull Severity severity,
        @Min(30) int evaluationWindowSeconds
) {
}
