package com.observability.monitoring.api;

import com.observability.monitoring.api.dto.DependencyEdge;
import com.observability.monitoring.api.dto.HostMetricDto;
import com.observability.monitoring.api.dto.InfrastructureSummary;
import com.observability.monitoring.api.dto.KubernetesOverview;
import com.observability.monitoring.api.dto.KubernetesPodDto;
import com.observability.monitoring.api.dto.MetricIngestRequest;
import com.observability.monitoring.api.dto.TraceSpanDto;
import com.observability.monitoring.service.MonitoringService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping
public class MonitoringController {

    private final MonitoringService monitoringService;

    public MonitoringController(MonitoringService monitoringService) {
        this.monitoringService = monitoringService;
    }

    @GetMapping("/monitoring/infra/summary")
    public InfrastructureSummary infrastructureSummary() {
        return monitoringService.infrastructureSummary();
    }

    @GetMapping("/monitoring/infra/hosts")
    public List<HostMetricDto> hosts() {
        return monitoringService.latestHosts();
    }

    @GetMapping("/monitoring/infra/history/{hours}")
    public List<HostMetricDto> history(@PathVariable int hours) {
        return monitoringService.history(Math.max(1, Math.min(hours, 168)));
    }

    @PostMapping("/monitoring/infra/metrics")
    public HostMetricDto ingest(@Valid @RequestBody MetricIngestRequest request) {
        return monitoringService.ingest(request);
    }

    @GetMapping("/monitoring/kubernetes/overview")
    public KubernetesOverview kubernetesOverview() {
        return monitoringService.kubernetesOverview();
    }

    @GetMapping("/monitoring/kubernetes/pods")
    public List<KubernetesPodDto> pods() {
        return monitoringService.pods();
    }

    @GetMapping("/monitoring/traces/dependencies")
    public List<DependencyEdge> dependencies() {
        return monitoringService.dependencies();
    }

    @GetMapping("/monitoring/traces/slow")
    public List<TraceSpanDto> slowTrace() {
        return monitoringService.slowTrace();
    }

    @GetMapping("/reports/cpu.csv")
    public ResponseEntity<String> cpuCsv() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cpu-report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(monitoringService.cpuReportCsv());
    }
}
