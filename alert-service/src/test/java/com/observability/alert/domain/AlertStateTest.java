package com.observability.alert.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class AlertStateTest {

    @Test
    void alertMovesThroughAcknowledgedAndResolvedStates() {
        Alert alert = new Alert(
                "CPU saturation",
                "prod-api-02",
                "system.cpu.usage",
                94.7,
                90,
                Severity.CRITICAL,
                "CPU saturation on prod-api-02"
        );

        alert.acknowledge();
        assertThat(alert.getStatus()).isEqualTo(AlertStatus.ACKNOWLEDGED);
        assertThat(alert.getAcknowledgedAt()).isNotNull();

        alert.resolve();
        assertThat(alert.getStatus()).isEqualTo(AlertStatus.RESOLVED);
        assertThat(alert.getResolvedAt()).isNotNull();
    }
}
