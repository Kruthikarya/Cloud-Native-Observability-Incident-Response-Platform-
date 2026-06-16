package com.observability.alert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "incident_timeline")
public class IncidentTimelineEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID incidentId;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private String actor;

    @Column(nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected IncidentTimelineEntry() {
    }

    public IncidentTimelineEntry(UUID incidentId, String eventType, String message, String actor) {
        this.incidentId = incidentId;
        this.eventType = eventType;
        this.message = message;
        this.actor = actor;
    }

    public UUID getId() {
        return id;
    }

    public UUID getIncidentId() {
        return incidentId;
    }

    public String getEventType() {
        return eventType;
    }

    public String getMessage() {
        return message;
    }

    public String getActor() {
        return actor;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
