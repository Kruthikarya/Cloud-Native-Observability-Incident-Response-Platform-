package com.observability.alert.service;

import com.observability.alert.domain.Alert;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class NotificationClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationClient.class);

    private final RestClient notificationRestClient;

    public NotificationClient(RestClient notificationRestClient) {
        this.notificationRestClient = notificationRestClient;
    }

    @CircuitBreaker(name = "notificationService", fallbackMethod = "fallback")
    public void sendAlertNotification(Alert alert) {
        notificationRestClient.post()
                .uri("/notifications")
                .body(Map.of(
                        "channel", "SLACK",
                        "message", alert.getMessage(),
                        "severity", alert.getSeverity().name(),
                        "status", "QUEUED"
                ))
                .retrieve()
                .toBodilessEntity();
    }

    public void fallback(Alert alert, Throwable throwable) {
        log.warn("Notification service unavailable for alert {}: {}", alert.getId(), throwable.getMessage());
    }
}
