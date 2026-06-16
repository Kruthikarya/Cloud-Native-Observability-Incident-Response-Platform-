package com.observability.monitoring.service;

import com.observability.monitoring.api.dto.DependencyEdge;
import com.observability.monitoring.api.dto.HostMetricDto;
import com.observability.monitoring.api.dto.InfrastructureSummary;
import com.observability.monitoring.api.dto.KubernetesOverview;
import com.observability.monitoring.api.dto.KubernetesPodDto;
import com.observability.monitoring.api.dto.MetricIngestRequest;
import com.observability.monitoring.api.dto.TraceSpanDto;
import com.observability.monitoring.domain.InfrastructureMetric;
import com.observability.monitoring.domain.KubernetesWorkload;
import com.observability.monitoring.domain.MetricSource;
import com.observability.monitoring.domain.PodStatus;
import com.observability.monitoring.repository.InfrastructureMetricRepository;
import com.observability.monitoring.repository.KubernetesWorkloadRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class MonitoringService {

    private static final List<String> HOSTS = List.of("prod-api-01", "prod-api-02", "prod-worker-01", "prod-db-01");
    private static final Random RANDOM = new Random(42);

    private final InfrastructureMetricRepository metricRepository;
    private final KubernetesWorkloadRepository workloadRepository;
    private final AtomicInteger availableHostsGauge = new AtomicInteger();
    private final AtomicInteger failingPodsGauge = new AtomicInteger();

    public MonitoringService(
            InfrastructureMetricRepository metricRepository,
            KubernetesWorkloadRepository workloadRepository,
            MeterRegistry meterRegistry
    ) {
        this.metricRepository = metricRepository;
        this.workloadRepository = workloadRepository;
        Gauge.builder("platform_hosts_available", availableHostsGauge, AtomicInteger::get)
                .description("Available infrastructure hosts")
                .register(meterRegistry);
        Gauge.builder("platform_kubernetes_failing_pods", failingPodsGauge, AtomicInteger::get)
                .description("Kubernetes pods in failed or crash-loop states")
                .register(meterRegistry);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${monitoring.simulation.fixed-delay:30000}", initialDelayString = "${monitoring.simulation.initial-delay:2000}")
    public void collectSyntheticMetrics() {
        OffsetDateTime now = OffsetDateTime.now();
        int hostIndex = 0;
        for (String host : HOSTS) {
            metricRepository.save(new InfrastructureMetric(
                    host,
                    "production",
                    bounded(35 + hostIndex * 11 + RANDOM.nextDouble(18)),
                    bounded(45 + hostIndex * 8 + RANDOM.nextDouble(16)),
                    bounded(50 + hostIndex * 7 + RANDOM.nextDouble(12)),
                    80 + RANDOM.nextDouble(90),
                    60 + RANDOM.nextDouble(85),
                    86400L * (15 + hostIndex) + RANDOM.nextInt(3600),
                    120 + RANDOM.nextInt(90),
                    hostIndex != 3 || RANDOM.nextDouble() > 0.18,
                    MetricSource.NODE_EXPORTER,
                    now.minusSeconds(hostIndex * 4L)
            ));
            hostIndex++;
        }

        seedWorkloads(now);
        refreshGauges();
    }

    @Transactional
    public HostMetricDto ingest(MetricIngestRequest request) {
        InfrastructureMetric metric = metricRepository.save(new InfrastructureMetric(
                request.hostName(),
                request.environment(),
                request.cpuUsage(),
                request.memoryUsage(),
                request.diskUsage(),
                request.networkInMbps(),
                request.networkOutMbps(),
                request.uptimeSeconds(),
                request.processCount(),
                request.available(),
                MetricSource.SYNTHETIC_CHECK,
                OffsetDateTime.now()
        ));
        refreshGauges();
        return HostMetricDto.from(metric);
    }

    @Transactional
    public List<HostMetricDto> latestHosts() {
        ensureSeeded();
        return metricRepository.latestPerHost().stream()
                .map(HostMetricDto::from)
                .toList();
    }

    @Transactional
    public List<HostMetricDto> history(int hours) {
        ensureSeeded();
        return metricRepository.findByCollectedAtAfterOrderByCollectedAtAsc(OffsetDateTime.now().minusHours(hours)).stream()
                .map(HostMetricDto::from)
                .toList();
    }

    @Transactional
    public InfrastructureSummary infrastructureSummary() {
        List<HostMetricDto> hosts = latestHosts();
        int available = (int) hosts.stream().filter(HostMetricDto::available).count();
        int critical = (int) hosts.stream()
                .filter(host -> host.cpuUsage() > 90 || host.memoryUsage() > 85 || host.diskUsage() > 80 || !host.available())
                .count();
        int warning = (int) hosts.stream()
                .filter(host -> host.cpuUsage() > 75 || host.memoryUsage() > 70 || host.diskUsage() > 70)
                .count();
        return new InfrastructureSummary(
                hosts.size(),
                available,
                average(hosts.stream().map(HostMetricDto::cpuUsage).toList()),
                average(hosts.stream().map(HostMetricDto::memoryUsage).toList()),
                average(hosts.stream().map(HostMetricDto::diskUsage).toList()),
                critical,
                warning
        );
    }

    @Transactional
    public KubernetesOverview kubernetesOverview() {
        List<KubernetesWorkload> pods = latestWorkloads();
        Map<String, Long> statusDistribution = pods.stream()
                .collect(Collectors.groupingBy(pod -> pod.getStatus().name(), LinkedHashMap::new, Collectors.counting()));

        return new KubernetesOverview(
                pods.stream().findFirst().map(KubernetesWorkload::getClusterName).orElse("kind-observability"),
                (int) pods.stream().map(KubernetesWorkload::getNamespaceName).distinct().count(),
                (int) pods.stream().map(KubernetesWorkload::getDeploymentName).distinct().count(),
                pods.stream().mapToInt(KubernetesWorkload::getDesiredReplicas).sum(),
                pods.stream().mapToInt(KubernetesWorkload::getReadyReplicas).sum(),
                pods.stream().filter(pod -> pod.getStatus() == PodStatus.RUNNING).count(),
                pods.stream().filter(pod -> pod.getStatus() == PodStatus.FAILED).count(),
                pods.stream().filter(pod -> pod.getStatus() == PodStatus.CRASH_LOOP_BACK_OFF).count(),
                pods.stream().mapToDouble(KubernetesWorkload::getCpuMillicores).average().orElse(0),
                pods.stream().mapToDouble(KubernetesWorkload::getMemoryMi).average().orElse(0),
                statusDistribution
        );
    }

    @Transactional
    public List<KubernetesPodDto> pods() {
        return latestWorkloads().stream()
                .map(KubernetesPodDto::from)
                .toList();
    }

    public List<DependencyEdge> dependencies() {
        return List.of(
                new DependencyEdge("api-gateway", "auth-service", 42, 0.02, "trace-auth-7f32"),
                new DependencyEdge("api-gateway", "monitoring-service", 95, 0.04, "trace-monitor-9aa1"),
                new DependencyEdge("monitoring-service", "alert-service", 126, 0.08, "trace-alert-d112"),
                new DependencyEdge("alert-service", "notification-service", 73, 0.01, "trace-notify-b431"),
                new DependencyEdge("alert-service", "postgresql", 18, 0.00, "trace-db-48ef")
        );
    }

    public List<TraceSpanDto> slowTrace() {
        return List.of(
                new TraceSpanDto("trace-monitor-9aa1", "span-001", "api-gateway", "GET /api/monitoring/infra/summary", 37, false),
                new TraceSpanDto("trace-monitor-9aa1", "span-002", "auth-service", "JWT validation", 12, false),
                new TraceSpanDto("trace-monitor-9aa1", "span-003", "monitoring-service", "Prometheus query", 2830, false),
                new TraceSpanDto("trace-monitor-9aa1", "span-004", "alert-service", "Evaluate rules", 143, false),
                new TraceSpanDto("trace-monitor-9aa1", "span-005", "notification-service", "Slack fanout", 88, false)
        );
    }

    public String cpuReportCsv() {
        StringBuilder csv = new StringBuilder("host,environment,cpuUsage,memoryUsage,diskUsage,available,collectedAt\n");
        latestHosts().stream()
                .sorted(Comparator.comparing(HostMetricDto::cpuUsage).reversed())
                .forEach(host -> csv.append(host.hostName()).append(',')
                        .append(host.environment()).append(',')
                        .append(format(host.cpuUsage())).append(',')
                        .append(format(host.memoryUsage())).append(',')
                        .append(format(host.diskUsage())).append(',')
                        .append(host.available()).append(',')
                        .append(host.collectedAt()).append('\n'));
        return csv.toString();
    }

    private List<KubernetesWorkload> latestWorkloads() {
        ensureSeeded();
        return workloadRepository.latestPerPod();
    }

    private void ensureSeeded() {
        if (metricRepository.count() == 0 || workloadRepository.count() == 0) {
            collectSyntheticMetrics();
        }
    }

    private void seedWorkloads(OffsetDateTime now) {
        workloadRepository.save(new KubernetesWorkload("kind-observability", "platform", "api-gateway", "api-gateway-7d8c9", "worker-a", PodStatus.RUNNING, 260, 512, 0, 2, 2, true, now));
        workloadRepository.save(new KubernetesWorkload("kind-observability", "platform", "monitoring-service", "monitoring-service-68fbd", "worker-b", PodStatus.RUNNING, 390, 768, 1, 2, 2, true, now));
        workloadRepository.save(new KubernetesWorkload("kind-observability", "platform", "alert-service", "alert-service-548dd", "worker-b", PodStatus.RUNNING, 215, 384, 0, 2, 2, true, now));
        workloadRepository.save(new KubernetesWorkload("kind-observability", "platform", "notification-service", "notification-service-995fc", "worker-c", PodStatus.CRASH_LOOP_BACK_OFF, 80, 196, 7, 2, 1, false, now));
        workloadRepository.save(new KubernetesWorkload("kind-observability", "data", "postgresql", "postgresql-0", "worker-c", PodStatus.RUNNING, 470, 1536, 0, 1, 1, false, now));
        workloadRepository.save(new KubernetesWorkload("kind-observability", "observability", "prometheus", "prometheus-0", "worker-a", PodStatus.RUNNING, 520, 2048, 0, 1, 1, false, now));
    }

    private void refreshGauges() {
        List<InfrastructureMetric> hosts = metricRepository.latestPerHost();
        List<KubernetesWorkload> workloads = workloadRepository.latestPerPod();
        availableHostsGauge.set((int) hosts.stream().filter(InfrastructureMetric::isAvailable).count());
        failingPodsGauge.set((int) workloads.stream()
                .filter(workload -> workload.getStatus() == PodStatus.FAILED || workload.getStatus() == PodStatus.CRASH_LOOP_BACK_OFF)
                .count());
    }

    private static double bounded(double value) {
        return Math.max(0, Math.min(99, value));
    }

    private static double average(List<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0);
    }

    private static String format(double value) {
        return String.format(java.util.Locale.US, "%.2f", value);
    }
}
