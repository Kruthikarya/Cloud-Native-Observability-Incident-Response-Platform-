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
@Table(name = "incidents")
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID alertId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status = IncidentStatus.OPEN;

    private String assignedTo;

    @Column(length = 2000)
    private String rootCause;

    @Column(length = 2000)
    private String resolution;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false)
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    private OffsetDateTime resolvedAt;

    protected Incident() {
    }

    public Incident(UUID alertId, String title, Severity severity) {
        this.alertId = alertId;
        this.title = title;
        this.severity = severity;
    }

    public UUID getId() {
        return id;
    }

    public UUID getAlertId() {
        return alertId;
    }

    public String getTitle() {
        return title;
    }

    public Severity getSeverity() {
        return severity;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public String getRootCause() {
        return rootCause;
    }

    public String getResolution() {
        return resolution;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public OffsetDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void assign(String engineer) {
        this.assignedTo = engineer;
        this.status = IncidentStatus.INVESTIGATING;
        this.updatedAt = OffsetDateTime.now();
    }

    public void addRootCause(String rootCause) {
        this.rootCause = rootCause;
        this.updatedAt = OffsetDateTime.now();
    }

    public void resolve(String resolution) {
        this.resolution = resolution;
        this.status = IncidentStatus.RESOLVED;
        this.resolvedAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }
}
