package com.observability.alert.api;

import com.observability.alert.api.dto.AlertDto;
import com.observability.alert.api.dto.AlertRuleDto;
import com.observability.alert.api.dto.AlertSummary;
import com.observability.alert.api.dto.CreateAlertRuleRequest;
import com.observability.alert.api.dto.MetricEventRequest;
import com.observability.alert.service.AlertManagementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/alerts")
public class AlertController {

    private final AlertManagementService alertManagementService;

    public AlertController(AlertManagementService alertManagementService) {
        this.alertManagementService = alertManagementService;
    }

    @GetMapping("/summary")
    public AlertSummary summary() {
        return alertManagementService.summary();
    }

    @GetMapping("/rules")
    public List<AlertRuleDto> rules() {
        return alertManagementService.rules();
    }

    @PostMapping("/rules")
    public AlertRuleDto createRule(@Valid @RequestBody CreateAlertRuleRequest request) {
        return alertManagementService.createRule(request);
    }

    @PostMapping("/evaluate")
    public List<AlertDto> evaluate(@Valid @RequestBody MetricEventRequest request) {
        return alertManagementService.evaluate(request);
    }

    @GetMapping
    public List<AlertDto> alerts() {
        return alertManagementService.alerts();
    }

    @PostMapping("/{alertId}/acknowledge")
    public AlertDto acknowledge(@PathVariable UUID alertId) {
        return alertManagementService.acknowledge(alertId);
    }

    @PostMapping("/{alertId}/resolve")
    public AlertDto resolve(@PathVariable UUID alertId) {
        return alertManagementService.resolve(alertId);
    }
}
