CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY,
    name VARCHAR(180) NOT NULL UNIQUE,
    metric_name VARCHAR(180) NOT NULL,
    operator VARCHAR(80) NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    severity VARCHAR(40) NOT NULL,
    evaluation_window_seconds INTEGER NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY,
    rule_name VARCHAR(180) NOT NULL,
    target VARCHAR(220) NOT NULL,
    metric_name VARCHAR(180) NOT NULL,
    observed_value DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    severity VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_status_created_at ON alerts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_target ON alerts (target);

CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY,
    alert_id UUID,
    title VARCHAR(500) NOT NULL,
    severity VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    assigned_to VARCHAR(180),
    root_cause VARCHAR(2000),
    resolution VARCHAR(2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_status_created_at ON incidents (status, created_at DESC);

CREATE TABLE IF NOT EXISTS incident_timeline (
    id UUID PRIMARY KEY,
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    event_type VARCHAR(120) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    actor VARCHAR(180) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident_time ON incident_timeline (incident_id, created_at ASC);
