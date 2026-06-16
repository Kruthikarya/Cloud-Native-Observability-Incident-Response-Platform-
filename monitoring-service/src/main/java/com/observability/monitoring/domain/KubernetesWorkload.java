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
@Table(name = "kubernetes_workloads")
public class KubernetesWorkload {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String clusterName;

    @Column(nullable = false)
    private String namespaceName;

    @Column(nullable = false)
    private String deploymentName;

    @Column(nullable = false)
    private String podName;

    @Column(nullable = false)
    private String nodeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PodStatus status;

    @Column(nullable = false)
    private double cpuMillicores;

    @Column(nullable = false)
    private double memoryMi;

    @Column(nullable = false)
    private int restartCount;

    @Column(nullable = false)
    private int desiredReplicas;

    @Column(nullable = false)
    private int readyReplicas;

    @Column(nullable = false)
    private boolean hpaEnabled;

    @Column(nullable = false)
    private OffsetDateTime observedAt;

    protected KubernetesWorkload() {
    }

    public KubernetesWorkload(
            String clusterName,
            String namespaceName,
            String deploymentName,
            String podName,
            String nodeName,
            PodStatus status,
            double cpuMillicores,
            double memoryMi,
            int restartCount,
            int desiredReplicas,
            int readyReplicas,
            boolean hpaEnabled,
            OffsetDateTime observedAt
    ) {
        this.clusterName = clusterName;
        this.namespaceName = namespaceName;
        this.deploymentName = deploymentName;
        this.podName = podName;
        this.nodeName = nodeName;
        this.status = status;
        this.cpuMillicores = cpuMillicores;
        this.memoryMi = memoryMi;
        this.restartCount = restartCount;
        this.desiredReplicas = desiredReplicas;
        this.readyReplicas = readyReplicas;
        this.hpaEnabled = hpaEnabled;
        this.observedAt = observedAt;
    }

    public UUID getId() {
        return id;
    }

    public String getClusterName() {
        return clusterName;
    }

    public String getNamespaceName() {
        return namespaceName;
    }

    public String getDeploymentName() {
        return deploymentName;
    }

    public String getPodName() {
        return podName;
    }

    public String getNodeName() {
        return nodeName;
    }

    public PodStatus getStatus() {
        return status;
    }

    public double getCpuMillicores() {
        return cpuMillicores;
    }

    public double getMemoryMi() {
        return memoryMi;
    }

    public int getRestartCount() {
        return restartCount;
    }

    public int getDesiredReplicas() {
        return desiredReplicas;
    }

    public int getReadyReplicas() {
        return readyReplicas;
    }

    public boolean isHpaEnabled() {
        return hpaEnabled;
    }

    public OffsetDateTime getObservedAt() {
        return observedAt;
    }
}
