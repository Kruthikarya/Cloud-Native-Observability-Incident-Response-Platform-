package com.observability.notification.api.dto;

import com.observability.notification.domain.NotificationChannel;
import com.observability.notification.domain.NotificationStatus;
import com.observability.notification.domain.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotNull NotificationChannel channel,
        @NotBlank String message,
        @NotNull Severity severity,
        NotificationStatus status
) {
}
