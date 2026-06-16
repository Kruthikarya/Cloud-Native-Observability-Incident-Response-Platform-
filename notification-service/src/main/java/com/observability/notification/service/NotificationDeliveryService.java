package com.observability.notification.service;

import com.observability.notification.api.dto.NotificationDto;
import com.observability.notification.api.dto.NotificationRequest;
import com.observability.notification.api.dto.NotificationSummary;
import com.observability.notification.domain.Notification;
import com.observability.notification.domain.NotificationChannel;
import com.observability.notification.domain.NotificationStatus;
import com.observability.notification.domain.Severity;
import com.observability.notification.repository.NotificationRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationDeliveryService {

    private final NotificationRepository notificationRepository;
    private final Counter sentCounter;

    public NotificationDeliveryService(NotificationRepository notificationRepository, MeterRegistry meterRegistry) {
        this.notificationRepository = notificationRepository;
        this.sentCounter = Counter.builder("platform_notifications_sent_total")
                .description("Mock notification deliveries")
                .register(meterRegistry);
    }

    @Transactional
    public NotificationDto send(NotificationRequest request) {
        Notification notification = notificationRepository.save(new Notification(
                request.channel(),
                request.message(),
                request.severity(),
                request.status() == null ? NotificationStatus.QUEUED : request.status()
        ));

        notification.markSent(mockProviderMessageId(notification.getChannel()));
        sentCounter.increment();
        return NotificationDto.from(notification);
    }

    @Transactional
    public List<NotificationDto> history() {
        seed();
        return notificationRepository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(NotificationDto::from)
                .toList();
    }

    @Transactional
    public NotificationSummary summary() {
        seed();
        return new NotificationSummary(
                notificationRepository.countByStatus(NotificationStatus.QUEUED),
                notificationRepository.countByStatus(NotificationStatus.SENT),
                notificationRepository.countByStatus(NotificationStatus.FAILED)
        );
    }

    @Transactional
    public void seed() {
        if (notificationRepository.count() == 0) {
            send(new NotificationRequest(NotificationChannel.SLACK, "CPU saturation on prod-api-02", Severity.CRITICAL, NotificationStatus.QUEUED));
            send(new NotificationRequest(NotificationChannel.EMAIL, "Deployment platform/api-gateway completed", Severity.LOW, NotificationStatus.QUEUED));
            send(new NotificationRequest(NotificationChannel.DISCORD, "Pod restart storm for notification-service", Severity.HIGH, NotificationStatus.QUEUED));
            send(new NotificationRequest(NotificationChannel.SMS, "Database disk usage exceeded 80 percent", Severity.HIGH, NotificationStatus.QUEUED));
        }
    }

    private static String mockProviderMessageId(NotificationChannel channel) {
        return channel.name().toLowerCase() + "-" + UUID.randomUUID();
    }
}
