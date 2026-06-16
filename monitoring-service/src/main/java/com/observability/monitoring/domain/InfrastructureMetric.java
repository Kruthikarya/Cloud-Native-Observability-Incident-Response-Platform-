package com.observability.monitoring.domain;

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
@Table(name = "infrastructure_metrics")
public class InfrastructureMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String hostName;

    @Column(nullable = false)
    private String environment;

    @Column(nullable = false)
    private double cpuUsage;

    @Column(nullable = false)
    private double memoryUsage;

    @Column(nullable = false)
    private double diskUsage;

    @Column(nullable = false)
    private double networkInMbps;

    @Column(nullable = false)
    private double networkOutMbps;

    @Column(nullable = false)
    private long uptimeSeconds;

    @Column(nullable = false)
    private int processCount;

    @Column(nullable = false)
    private boolean available;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetricSource source;

    @Column(nullable = false)
    private OffsetDateTime collectedAt;

    protected InfrastructureMetric() {
    }

    public InfrastructureMetric(
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
            MetricSource source,
            OffsetDateTime collectedAt
    ) {
        this.hostName = hostName;
        this.environment = environment;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.diskUsage = diskUsage;
        this.networkInMbps = networkInMbps;
        this.networkOutMbps = networkOutMbps;
        this.uptimeSeconds = uptimeSeconds;
        this.processCount = processCount;
        this.available = available;
        this.source = source;
        this.collectedAt = collectedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getHostName() {
        return hostName;
    }

    public String getEnvironment() {
        return environment;
    }

    public double getCpuUsage() {
        return cpuUsage;
    }

    public double getMemoryUsage() {
        return memoryUsage;
    }

    public double getDiskUsage() {
        return diskUsage;
    }

    public double getNetworkInMbps() {
        return networkInMbps;
    }

    public double getNetworkOutMbps() {
        return networkOutMbps;
    }

    public long getUptimeSeconds() {
        return uptimeSeconds;
    }

    public int getProcessCount() {
        return processCount;
    }

    public boolean isAvailable() {
        return available;
    }

    public MetricSource getSource() {
        return source;
    }

    public OffsetDateTime getCollectedAt() {
        return collectedAt;
    }
}
