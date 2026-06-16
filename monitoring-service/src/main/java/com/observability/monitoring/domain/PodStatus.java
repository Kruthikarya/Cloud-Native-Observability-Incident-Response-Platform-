package com.observability.monitoring.domain;

public enum PodStatus {
    RUNNING,
    PENDING,
    FAILED,
    SUCCEEDED,
    CRASH_LOOP_BACK_OFF
}
