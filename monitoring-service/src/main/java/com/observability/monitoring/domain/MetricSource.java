package com.observability.monitoring.domain;

public enum MetricSource {
    NODE_EXPORTER,
    CADVISOR,
    KUBE_STATE_METRICS,
    SYNTHETIC_CHECK
}
