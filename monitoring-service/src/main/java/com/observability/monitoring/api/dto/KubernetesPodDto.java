package com.observability.monitoring.api.dto;

import com.observability.monitoring.domain.KubernetesWorkload;

import java.time.OffsetDateTime;

public record KubernetesPodDto(
        String clusterName,
        String namespaceName,
        String deploymentName,
        String podName,
        String nodeName,
        String status,
        double cpuMillicores,
        double memoryMi,
        int restartCount,
        int desiredReplicas,
        int readyReplicas,
        boolean hpaEnabled,
        OffsetDateTime observedAt
) {
    public static KubernetesPodDto from(KubernetesWorkload workload) {
        return new KubernetesPodDto(
                workload.getClusterName(),
                workload.getNamespaceName(),
                workload.getDeploymentName(),
                workload.getPodName(),
                workload.getNodeName(),
                workload.getStatus().name(),
                workload.getCpuMillicores(),
                workload.getMemoryMi(),
                workload.getRestartCount(),
                workload.getDesiredReplicas(),
                workload.getReadyReplicas(),
                workload.isHpaEnabled(),
                workload.getObservedAt()
        );
    }
}
