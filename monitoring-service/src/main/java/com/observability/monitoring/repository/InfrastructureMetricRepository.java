package com.observability.monitoring.repository;

import com.observability.monitoring.domain.InfrastructureMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InfrastructureMetricRepository extends JpaRepository<InfrastructureMetric, UUID> {

    List<InfrastructureMetric> findTop200ByOrderByCollectedAtDesc();

    List<InfrastructureMetric> findByCollectedAtAfterOrderByCollectedAtAsc(OffsetDateTime since);

    @Query("""
            select m from InfrastructureMetric m
            where m.collectedAt = (
                select max(latest.collectedAt) from InfrastructureMetric latest where latest.hostName = m.hostName
            )
            order by m.hostName
            """)
    List<InfrastructureMetric> latestPerHost();

    Optional<InfrastructureMetric> findTopByHostNameOrderByCollectedAtDesc(String hostName);
}
