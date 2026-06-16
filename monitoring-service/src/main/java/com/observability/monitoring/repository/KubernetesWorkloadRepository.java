package com.observability.monitoring.repository;

import com.observability.monitoring.domain.KubernetesWorkload;
import com.observability.monitoring.domain.PodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface KubernetesWorkloadRepository extends JpaRepository<KubernetesWorkload, UUID> {

    List<KubernetesWorkload> findTop200ByOrderByObservedAtDesc();

    long countByStatus(PodStatus status);

    @Query("""
            select w from KubernetesWorkload w
            where w.observedAt = (
                select max(latest.observedAt) from KubernetesWorkload latest where latest.podName = w.podName
            )
            order by w.namespaceName, w.deploymentName, w.podName
            """)
    List<KubernetesWorkload> latestPerPod();
}
