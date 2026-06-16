CREATE TABLE IF NOT EXISTS infrastructure_metrics (
    id UUID PRIMARY KEY,
    host_name VARCHAR(160) NOT NULL,
    environment VARCHAR(80) NOT NULL,
    cpu_usage DOUBLE PRECISION NOT NULL,
    memory_usage DOUBLE PRECISION NOT NULL,
    disk_usage DOUBLE PRECISION NOT NULL,
    network_in_mbps DOUBLE PRECISION NOT NULL,
    network_out_mbps DOUBLE PRECISION NOT NULL,
    uptime_seconds BIGINT NOT NULL,
    process_count INTEGER NOT NULL,
    available BOOLEAN NOT NULL,
    source VARCHAR(80) NOT NULL,
    collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_host_time ON infrastructure_metrics (host_name, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_infrastructure_metrics_collected_at ON infrastructure_metrics (collected_at DESC);

CREATE TABLE IF NOT EXISTS kubernetes_workloads (
    id UUID PRIMARY KEY,
    cluster_name VARCHAR(160) NOT NULL,
    namespace_name VARCHAR(160) NOT NULL,
    deployment_name VARCHAR(160) NOT NULL,
    pod_name VARCHAR(220) NOT NULL,
    node_name VARCHAR(160) NOT NULL,
    status VARCHAR(80) NOT NULL,
    cpu_millicores DOUBLE PRECISION NOT NULL,
    memory_mi DOUBLE PRECISION NOT NULL,
    restart_count INTEGER NOT NULL,
    desired_replicas INTEGER NOT NULL,
    ready_replicas INTEGER NOT NULL,
    hpa_enabled BOOLEAN NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_kubernetes_workloads_pod_time ON kubernetes_workloads (pod_name, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_kubernetes_workloads_status ON kubernetes_workloads (status);
