package com.observability.notification.api;

import com.observability.notification.api.dto.NotificationDto;
import com.observability.notification.api.dto.NotificationRequest;
import com.observability.notification.api.dto.NotificationSummary;
import com.observability.notification.service.NotificationDeliveryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationDeliveryService deliveryService;

    public NotificationController(NotificationDeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping
    public NotificationDto send(@Valid @RequestBody NotificationRequest request) {
        return deliveryService.send(request);
    }

    @GetMapping
    public List<NotificationDto> history() {
        return deliveryService.history();
    }

    @GetMapping("/summary")
    public NotificationSummary summary() {
        return deliveryService.summary();
    }
}
