package com.observability.alert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alert_rules")
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String metricName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RuleOperator operator;

    @Column(nullable = false)
    private double threshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false)
    private int evaluationWindowSeconds;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected AlertRule() {
    }

    public AlertRule(String name, String metricName, RuleOperator operator, double threshold, Severity severity, int evaluationWindowSeconds) {
        this.name = name;
        this.metricName = metricName;
        this.operator = operator;
        this.threshold = threshold;
        this.severity = severity;
        this.evaluationWindowSeconds = evaluationWindowSeconds;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getMetricName() {
        return metricName;
    }

    public RuleOperator getOperator() {
        return operator;
    }

    public double getThreshold() {
        return threshold;
    }

    public Severity getSeverity() {
        return severity;
    }

    public int getEvaluationWindowSeconds() {
        return evaluationWindowSeconds;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
