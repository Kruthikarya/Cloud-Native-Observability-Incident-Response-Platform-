package com.observability.notification.api.dto;

public record NotificationSummary(
        long queued,
        long sent,
        long failed
) {
}
