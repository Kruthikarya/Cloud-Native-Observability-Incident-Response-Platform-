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
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String ruleName;

    @Column(nullable = false)
    private String target;

    @Column(nullable = false)
    private String metricName;

    @Column(nullable = false)
    private double observedValue;

    @Column(nullable = false)
    private double threshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status = AlertStatus.ACTIVE;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime acknowledgedAt;

    private OffsetDateTime resolvedAt;

    protected Alert() {
    }

    public Alert(String ruleName, String target, String metricName, double observedValue, double threshold, Severity severity, String message) {
        this.ruleName = ruleName;
        this.target = target;
        this.metricName = metricName;
        this.observedValue = observedValue;
        this.threshold = threshold;
        this.severity = severity;
        this.message = message;
    }

    public UUID getId() {
        return id;
    }

    public String getRuleName() {
        return ruleName;
    }

    public String getTarget() {
        return target;
    }

    public String getMetricName() {
        return metricName;
    }

    public double getObservedValue() {
        return observedValue;
    }

    public double getThreshold() {
        return threshold;
    }

    public Severity getSeverity() {
        return severity;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public OffsetDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void acknowledge() {
        this.status = AlertStatus.ACKNOWLEDGED;
        this.acknowledgedAt = OffsetDateTime.now();
    }

    public void resolve() {
        this.status = AlertStatus.RESOLVED;
        this.resolvedAt = OffsetDateTime.now();
    }
}
