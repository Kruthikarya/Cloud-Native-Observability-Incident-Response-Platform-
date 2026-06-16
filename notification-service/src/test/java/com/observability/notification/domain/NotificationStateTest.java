package com.observability.notification.domain;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class NotificationStateTest {

    @Test
    void notificationCanBeMarkedSent() {
        Notification notification = new Notification(
                NotificationChannel.SLACK,
                "CPU saturation on prod-api-02",
                Severity.CRITICAL,
                NotificationStatus.QUEUED
        );

        notification.markSent("slack-123");

        assertThat(notification.getStatus()).isEqualTo(NotificationStatus.SENT);
        assertThat(notification.getProviderMessageId()).isEqualTo("slack-123");
        assertThat(notification.getSentAt()).isNotNull();
    }
}
