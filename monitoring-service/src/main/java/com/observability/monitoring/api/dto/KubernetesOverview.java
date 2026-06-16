package com.observability.monitoring.api.dto;

import java.util.Map;

public record KubernetesOverview(
        String clusterName,
        int namespaces,
        int deployments,
        int desiredReplicas,
        int readyReplicas,
        long runningPods,
        long failedPods,
        long crashLoopBackOffPods,
        double averagePodCpuMillicores,
        double averagePodMemoryMi,
        Map<String, Long> podStatusDistribution
) {
}
