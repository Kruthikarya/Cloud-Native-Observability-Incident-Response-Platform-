package com.observability.notification.api.dto;

import com.observability.notification.domain.Notification;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NotificationDto(
        UUID notificationId,
        String channel,
        String message,
        String severity,
        OffsetDateTime createdAt,
        OffsetDateTime sentAt,
        String status,
        String providerMessageId
) {
    public static NotificationDto from(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getChannel().name(),
                notification.getMessage(),
                notification.getSeverity().name(),
                notification.getCreatedAt(),
                notification.getSentAt(),
                notification.getStatus().name(),
                notification.getProviderMessageId()
        );
    }
}
