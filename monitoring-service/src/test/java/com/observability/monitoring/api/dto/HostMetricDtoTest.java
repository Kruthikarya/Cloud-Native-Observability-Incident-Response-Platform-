package com.observability.monitoring.api.dto;

import com.observability.monitoring.domain.InfrastructureMetric;
import com.observability.monitoring.domain.MetricSource;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class HostMetricDtoTest {

    @Test
    void mapsInfrastructureMetricForApiResponse() {
        InfrastructureMetric metric = new InfrastructureMetric(
                "prod-api-01",
                "production",
                91.2,
                72.0,
                64.0,
                120,
                90,
                3600,
                140,
                true,
                MetricSource.NODE_EXPORTER,
                OffsetDateTime.parse("2026-05-28T10:15:30Z")
        );

        HostMetricDto dto = HostMetricDto.from(metric);

        assertThat(dto.hostName()).isEqualTo("prod-api-01");
        assertThat(dto.cpuUsage()).isEqualTo(91.2);
        assertThat(dto.source()).isEqualTo("NODE_EXPORTER");
    }
}
