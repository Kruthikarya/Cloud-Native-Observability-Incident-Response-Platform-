package com.observability.alert.service;

import com.observability.alert.api.dto.AlertDto;
import com.observability.alert.api.dto.AlertRuleDto;
import com.observability.alert.api.dto.AlertSummary;
import com.observability.alert.api.dto.CreateAlertRuleRequest;
import com.observability.alert.api.dto.IncidentDto;
import com.observability.alert.api.dto.IncidentTimelineDto;
import com.observability.alert.api.dto.MetricEventRequest;
import com.observability.alert.domain.Alert;
import com.observability.alert.domain.AlertRule;
import com.observability.alert.domain.AlertStatus;
import com.observability.alert.domain.Incident;
import com.observability.alert.domain.IncidentStatus;
import com.observability.alert.domain.IncidentTimelineEntry;
import com.observability.alert.domain.RuleOperator;
import com.observability.alert.domain.Severity;
import com.observability.alert.repository.AlertRepository;
import com.observability.alert.repository.AlertRuleRepository;
import com.observability.alert.repository.IncidentRepository;
import com.observability.alert.repository.IncidentTimelineRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class AlertManagementService {

    private final AlertRuleRepository ruleRepository;
    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentTimelineRepository timelineRepository;
    private final NotificationClient notificationClient;
    private final Counter triggeredAlertsCounter;

    public AlertManagementService(
            AlertRuleRepository ruleRepository,
            AlertRepository alertRepository,
            IncidentRepository incidentRepository,
            IncidentTimelineRepository timelineRepository,
            NotificationClient notificationClient,
            MeterRegistry meterRegistry
    ) {
        this.ruleRepository = ruleRepository;
        this.alertRepository = alertRepository;
        this.incidentRepository = incidentRepository;
        this.timelineRepository = timelineRepository;
        this.notificationClient = notificationClient;
        this.triggeredAlertsCounter = Counter.builder("platform_alerts_triggered_total")
                .description("Total triggered alerts")
                .register(meterRegistry);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${alerts.seed.fixed-delay:60000}", initialDelayString = "${alerts.seed.initial-delay:4000}")
    public void seedOperationalAlerts() {
        seedRules();
        if (alertRepository.count() == 0) {
            evaluate(new MetricEventRequest("prod-api-02", "system.cpu.usage", 94.7, null));
            evaluate(new MetricEventRequest("notification-service-995fc", "kubernetes.pod.restart_count", 7, null));
            evaluate(new MetricEventRequest("prod-db-01", "system.disk.usage", 86.2, null));
        }
    }

    @Transactional
    public AlertRuleDto createRule(CreateAlertRuleRequest request) {
        AlertRule rule = ruleRepository.save(new AlertRule(
                request.name(),
                request.metricName(),
                request.operator(),
                request.threshold(),
                request.severity(),
                request.evaluationWindowSeconds()
        ));
        return AlertRuleDto.from(rule);
    }

    @Transactional
    public List<AlertRuleDto> rules() {
        seedRules();
        return ruleRepository.findAll().stream().map(AlertRuleDto::from).toList();
    }

    @Transactional
    public List<AlertDto> evaluate(MetricEventRequest event) {
        seedRules();
        return ruleRepository.findByEnabledTrueOrderBySeverityAscNameAsc().stream()
                .filter(rule -> rule.getMetricName().equalsIgnoreCase(event.metricName()))
                .filter(rule -> matches(rule, event.value()))
                .map(rule -> trigger(rule, event))
                .map(AlertDto::from)
                .toList();
    }

    @Transactional
    public List<AlertDto> alerts() {
        seedOperationalAlerts();
        return alertRepository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(AlertDto::from)
                .toList();
    }

    @Transactional
    public AlertDto acknowledge(UUID alertId) {
        Alert alert = alertRepository.findById(alertId).orElseThrow(NoSuchElementException::new);
        alert.acknowledge();
        return AlertDto.from(alert);
    }

    @Transactional
    public AlertDto resolve(UUID alertId) {
        Alert alert = alertRepository.findById(alertId).orElseThrow(NoSuchElementException::new);
        alert.resolve();
        return AlertDto.from(alert);
    }

    @Transactional
    public List<IncidentDto> incidents() {
        seedOperationalAlerts();
        return incidentRepository.findTop200ByOrderByCreatedAtDesc().stream()
                .map(IncidentDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentTimelineDto> timeline(UUID incidentId) {
        return timelineRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId).stream()
                .map(IncidentTimelineDto::from)
                .toList();
    }

    @Transactional
    public IncidentDto assign(UUID incidentId, String engineer, String actor) {
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(NoSuchElementException::new);
        incident.assign(engineer);
        timelineRepository.save(new IncidentTimelineEntry(incident.getId(), "ASSIGNED", "Assigned to " + engineer, actorOrSystem(actor)));
        return IncidentDto.from(incident);
    }

    @Transactional
    public IncidentDto rootCause(UUID incidentId, String note, String actor) {
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(NoSuchElementException::new);
        incident.addRootCause(note);
        timelineRepository.save(new IncidentTimelineEntry(incident.getId(), "ROOT_CAUSE", note, actorOrSystem(actor)));
        return IncidentDto.from(incident);
    }

    @Transactional
    public IncidentDto resolveIncident(UUID incidentId, String resolution, String actor) {
        Incident incident = incidentRepository.findById(incidentId).orElseThrow(NoSuchElementException::new);
        incident.resolve(resolution);
        timelineRepository.save(new IncidentTimelineEntry(incident.getId(), "RESOLVED", resolution, actorOrSystem(actor)));
        return IncidentDto.from(incident);
    }

    @Transactional
    public AlertSummary summary() {
        seedOperationalAlerts();
        return new AlertSummary(
                alertRepository.countByStatus(AlertStatus.ACTIVE),
                alertRepository.countByStatus(AlertStatus.ACKNOWLEDGED),
                alertRepository.countByStatus(AlertStatus.RESOLVED),
                incidentRepository.countByStatus(IncidentStatus.OPEN),
                incidentRepository.countByStatus(IncidentStatus.INVESTIGATING),
                incidentRepository.countByStatus(IncidentStatus.RESOLVED)
        );
    }

    private Alert trigger(AlertRule rule, MetricEventRequest event) {
        String message = "%s on %s is %.2f, threshold %.2f".formatted(
                rule.getName(),
                event.target(),
                event.value(),
                rule.getThreshold()
        );
        Alert alert = alertRepository.save(new Alert(
                rule.getName(),
                event.target(),
                rule.getMetricName(),
                event.value(),
                rule.getThreshold(),
                rule.getSeverity(),
                message
        ));
        triggeredAlertsCounter.increment();
        if (rule.getSeverity() == Severity.CRITICAL || rule.getSeverity() == Severity.HIGH) {
            Incident incident = incidentRepository.save(new Incident(alert.getId(), message, rule.getSeverity()));
            timelineRepository.save(new IncidentTimelineEntry(incident.getId(), "CREATED", "Incident created from alert " + alert.getId(), "system"));
        }
        notificationClient.sendAlertNotification(alert);
        return alert;
    }

    private boolean matches(AlertRule rule, double value) {
        return switch (rule.getOperator()) {
            case GREATER_THAN -> value > rule.getThreshold();
            case LESS_THAN -> value < rule.getThreshold();
            case EQUALS -> Double.compare(value, rule.getThreshold()) == 0;
        };
    }

    private void seedRules() {
        seedRule("CPU saturation", "system.cpu.usage", RuleOperator.GREATER_THAN, 90, Severity.CRITICAL, 120);
        seedRule("Memory pressure", "system.memory.usage", RuleOperator.GREATER_THAN, 85, Severity.HIGH, 180);
        seedRule("Disk exhaustion risk", "system.disk.usage", RuleOperator.GREATER_THAN, 80, Severity.HIGH, 300);
        seedRule("Pod restart storm", "kubernetes.pod.restart_count", RuleOperator.GREATER_THAN, 5, Severity.CRITICAL, 120);
        seedRule("High request latency", "http.server.requests.p95", RuleOperator.GREATER_THAN, 3000, Severity.MEDIUM, 180);
        seedRule("Service availability check", "service.availability", RuleOperator.LESS_THAN, 1, Severity.CRITICAL, 60);
    }

    private void seedRule(String name, String metric, RuleOperator operator, double threshold, Severity severity, int window) {
        if (!ruleRepository.existsByNameIgnoreCase(name)) {
            ruleRepository.save(new AlertRule(name, metric, operator, threshold, severity, window));
        }
    }

    private static String actorOrSystem(String actor) {
        return actor == null || actor.isBlank() ? "system" : actor;
    }
}
