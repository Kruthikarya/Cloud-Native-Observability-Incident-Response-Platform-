import {
  Activity,
  AlertTriangle,
  Bell,
  BellRing,
  BarChart3,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Columns3,
  Database,
  Download,
  Filter,
  Focus,
  Gauge,
  GitBranch,
  Grid2X2,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  Lock,
  Mail,
  Maximize2,
  Menu,
  Minus,
  Moon,
  MoreVertical,
  Network,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Siren,
  SlidersHorizontal,
  Slack,
  TerminalSquare,
  UserRound,
  Users
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["services", "Services", Network],
  ["metrics", "Metrics", Gauge],
  ["alerts", "Alerts", Siren],
  ["logs", "Logs", TerminalSquare],
  ["traces", "Traces", GitBranch],
  ["infrastructure", "Infrastructure", Server],
  ["kubernetes", "Kubernetes", Boxes],
  ["reports", "Reports", Download],
  ["notifications", "Notifications", Bell],
  ["settings", "Settings", Settings],
  ["users", "Users", Users]
];

const trend = [
  { time: "09:00", cpu: 48, memory: 61, latency: 220, alerts: 1 },
  { time: "10:00", cpu: 58, memory: 64, latency: 310, alerts: 2 },
  { time: "11:00", cpu: 72, memory: 69, latency: 530, alerts: 2 },
  { time: "12:00", cpu: 86, memory: 78, latency: 1170, alerts: 5 },
  { time: "13:00", cpu: 94, memory: 82, latency: 2840, alerts: 8 },
  { time: "14:00", cpu: 69, memory: 72, latency: 640, alerts: 3 }
];

const timeRangeOptions = [
  { label: "Last 15 Minutes", hours: 0.25 },
  { label: "Last 1 Hour", hours: 1 },
  { label: "Last 6 Hours", hours: 6 },
  { label: "Last 24 Hours", hours: 24 },
  { label: "Last 7 Days", hours: 168 }
];

const fallback = {
  infraSummary: {
    totalHosts: 4,
    availableHosts: 3,
    averageCpu: 71.4,
    averageMemory: 68.8,
    averageDisk: 70.5,
    criticalHosts: 2,
    warningHosts: 3
  },
  hosts: [
    { hostName: "prod-api-01", environment: "production", cpuUsage: 52, memoryUsage: 61, diskUsage: 59, networkInMbps: 132, networkOutMbps: 88, uptimeSeconds: 1728000, processCount: 142, available: true },
    { hostName: "prod-api-02", environment: "production", cpuUsage: 94, memoryUsage: 81, diskUsage: 73, networkInMbps: 221, networkOutMbps: 166, uptimeSeconds: 1489000, processCount: 193, available: true },
    { hostName: "prod-worker-01", environment: "production", cpuUsage: 66, memoryUsage: 72, diskUsage: 68, networkInMbps: 118, networkOutMbps: 91, uptimeSeconds: 1812000, processCount: 154, available: true },
    { hostName: "prod-db-01", environment: "production", cpuUsage: 74, memoryUsage: 88, diskUsage: 86, networkInMbps: 94, networkOutMbps: 112, uptimeSeconds: 1953000, processCount: 126, available: false }
  ],
  kube: {
    clusterName: "kind-observability",
    namespaces: 3,
    deployments: 6,
    desiredReplicas: 10,
    readyReplicas: 9,
    runningPods: 5,
    failedPods: 0,
    crashLoopBackOffPods: 1,
    averagePodCpuMillicores: 322,
    averagePodMemoryMi: 907,
    podStatusDistribution: { RUNNING: 68, PENDING: 6, FAILED: 3, SUCCEEDED: 10 }
  },
  pods: [
    { namespaceName: "platform", deploymentName: "api-gateway", podName: "api-gateway-7d8c9", nodeName: "worker-a", status: "RUNNING", cpuMillicores: 260, memoryMi: 512, restartCount: 0, desiredReplicas: 2, readyReplicas: 2, hpaEnabled: true },
    { namespaceName: "platform", deploymentName: "monitoring-service", podName: "monitoring-service-68fbd", nodeName: "worker-b", status: "RUNNING", cpuMillicores: 390, memoryMi: 768, restartCount: 1, desiredReplicas: 2, readyReplicas: 2, hpaEnabled: true },
    { namespaceName: "platform", deploymentName: "notification-service", podName: "notification-service-995fc", nodeName: "worker-c", status: "CRASH_LOOP_BACK_OFF", cpuMillicores: 80, memoryMi: 196, restartCount: 7, desiredReplicas: 2, readyReplicas: 1, hpaEnabled: false }
  ],
  dependencies: [
    { source: "api-gateway", target: "auth-service", p95LatencyMs: 42, errorRate: 0.02, traceId: "trace-auth-7f32" },
    { source: "api-gateway", target: "monitoring-service", p95LatencyMs: 95, errorRate: 0.04, traceId: "trace-monitor-9aa1" },
    { source: "monitoring-service", target: "alert-service", p95LatencyMs: 126, errorRate: 0.08, traceId: "trace-alert-d112" },
    { source: "alert-service", target: "notification-service", p95LatencyMs: 73, errorRate: 0.01, traceId: "trace-notify-b431" }
  ],
  spans: [
    { serviceName: "api-gateway", operation: "GET /api/monitoring/infra/summary", durationMs: 37, error: false },
    { serviceName: "auth-service", operation: "JWT validation", durationMs: 12, error: false },
    { serviceName: "monitoring-service", operation: "Prometheus query", durationMs: 2830, error: false },
    { serviceName: "alert-service", operation: "Evaluate rules", durationMs: 143, error: false }
  ],
  services: [
    { serviceName: "api-gateway", status: "Healthy", uptime: "99.95%", responseTime: "120 ms", requests: 2840 },
    { serviceName: "monitoring-service", status: "Healthy", uptime: "99.92%", responseTime: "200 ms", requests: 1930 },
    { serviceName: "alert-service", status: "Healthy", uptime: "99.91%", responseTime: "180 ms", requests: 1215 },
    { serviceName: "notification-service", status: "Healthy", uptime: "99.93%", responseTime: "150 ms", requests: 918 },
    { serviceName: "dashboard-ui", status: "Healthy", uptime: "99.96%", responseTime: "80 ms", requests: 1421 },
    { serviceName: "auth-service", status: "Unhealthy", uptime: "98.10%", responseTime: "1.2 s", requests: 223 }
  ],
  logs: [
    { level: "INFO", message: "Service started successfully", service: "monitoring-service", time: "11:00:23" },
    { level: "WARN", message: "High memory usage detected", service: "alert-service", time: "10:59:58" },
    { level: "ERROR", message: "Failed to connect to database", service: "auth-service", time: "10:59:42" },
    { level: "INFO", message: "Notification sent to user", service: "notification-service", time: "10:59:31" },
    { level: "ERROR", message: "Service health check failed", service: "auth-service", time: "10:59:15" }
  ],
  alertSummary: { activeAlerts: 3, acknowledgedAlerts: 1, resolvedAlerts: 8, openIncidents: 2, investigatingIncidents: 1, resolvedIncidents: 5 },
  alerts: [
    { id: "a1", severity: "CRITICAL", status: "ACTIVE", target: "prod-api-02", ruleName: "CPU saturation", observedValue: 94.7, threshold: 90, message: "CPU saturation on prod-api-02 is 94.70, threshold 90.00" },
    { id: "a2", severity: "HIGH", status: "ACKNOWLEDGED", target: "prod-db-01", ruleName: "Disk exhaustion risk", observedValue: 86.2, threshold: 80, message: "Disk exhaustion risk on prod-db-01" },
    { id: "a3", severity: "CRITICAL", status: "ACTIVE", target: "notification-service-995fc", ruleName: "Pod restart storm", observedValue: 7, threshold: 5, message: "Pod restart storm for notification-service" }
  ],
  incidents: [
    { id: "i1", title: "CPU saturation on prod-api-02", severity: "CRITICAL", status: "OPEN", assignedTo: "Sam SRE", rootCause: "Traffic spike after deployment" },
    { id: "i2", title: "Pod restart storm for notification-service", severity: "CRITICAL", status: "INVESTIGATING", assignedTo: "Devin DevOps", rootCause: "Webhook secret mismatch" }
  ],
  notifications: [
    { notificationId: "n1", channel: "SLACK", severity: "CRITICAL", status: "SENT", message: "CPU saturation on prod-api-02", createdAt: "2m ago" },
    { notificationId: "n2", channel: "EMAIL", severity: "LOW", status: "SENT", message: "Deployment platform/api-gateway completed", createdAt: "8m ago" },
    { notificationId: "n3", channel: "DISCORD", severity: "HIGH", status: "SENT", message: "Pod restart storm for notification-service", createdAt: "14m ago" }
  ],
  users: [
    { email: "admin@ops.local", fullName: "Avery Admin", roles: ["ADMIN"], enabled: true },
    { email: "devops@ops.local", fullName: "Devin DevOps", roles: ["DEVOPS_ENGINEER"], enabled: true },
    { email: "sre@ops.local", fullName: "Sam SRE", roles: ["SRE_ENGINEER"], enabled: true }
  ]
};

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("platform-token"));
  const [page, setPage] = useState("dashboard");
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState("demo data");
  const [timeRanges, setTimeRanges] = useState({
    dashboard: "Last 1 Hour",
    services: "Last 1 Hour",
    metrics: "Last 1 Hour",
    traces: "Last 15 Minutes",
    infrastructure: "Last 24 Hours"
  });
  const [openMenu, setOpenMenu] = useState(null);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem("platform-theme") || "dark");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [serviceScope, setServiceScope] = useState("All Services");
  const [notice, setNotice] = useState("");
  const searchRef = useRef(null);

  const authenticated = Boolean(token);

  async function api(path) {
    const response = await fetch(path, {
      headers: token && token !== "demo-token" ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) throw new Error(`Request failed: ${path}`);
    return response.json();
  }

  async function refresh() {
    if (!authenticated) return;
    setLoading(true);
    const endpoints = [
      ["infraSummary", "/api/monitoring/infra/summary"],
      ["hosts", "/api/monitoring/infra/hosts"],
      ["kube", "/api/monitoring/kubernetes/overview"],
      ["pods", "/api/monitoring/kubernetes/pods"],
      ["dependencies", "/api/monitoring/traces/dependencies"],
      ["spans", "/api/monitoring/traces/slow"],
      ["alertSummary", "/api/alerts/summary"],
      ["alerts", "/api/alerts"],
      ["incidents", "/api/incidents"],
      ["notifications", "/api/notifications"],
      ["users", "/api/auth/users"]
    ];
    const results = await Promise.allSettled(endpoints.map(([, path]) => api(path)));
    const next = { ...fallback };
    results.forEach((result, index) => {
      if (result.status === "fulfilled") next[endpoints[index][0]] = result.value;
    });
    setData(next);
    setLastUpdated(results.some((result) => result.status === "fulfilled") ? new Date().toLocaleTimeString() : "demo data");
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, [authenticated]);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    localStorage.setItem("platform-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(""), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function applyTimeRange(nextRange) {
    setTimeRanges((current) => ({ ...current, [page]: nextRange }));
    setOpenMenu(null);
    refresh();
  }

  function runPageAction(type) {
    window.dispatchEvent(new CustomEvent("platform-page-action", { detail: type }));
  }

  function onLogin(nextToken) {
    localStorage.setItem("platform-token", nextToken);
    setToken(nextToken);
  }

  function logout() {
    localStorage.removeItem("platform-token");
    setToken(null);
  }

  if (!authenticated) {
    return <LoginScreen onLogin={onLogin} />;
  }

  const activeLabel = navItems.find(([key]) => key === page)?.[1] ?? "Dashboard";
  const pageCopy = {
    dashboard: ["Dashboard", "Overview of your infrastructure and services"],
    services: ["Services Overview", "Monitor and manage all your services in real-time"],
    metrics: ["Metrics", "Real-time metrics and performance monitoring"],
    traces: ["Distributed Tracing", "Track requests as they flow through your distributed system"],
    infrastructure: ["Infrastructure Overview", "Monitor your entire infrastructure and resource usage"]
  };
  const [pageTitle, pageSubtitle] = pageCopy[page] ?? [activeLabel, "Operational workspace for production reliability"];
  const timeRange = timeRanges[page] ?? "Last 1 Hour";

  return (
    <div className={`shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><BarChart3 size={20} /></span>
          <span>Monitoring Platform</span>
        </div>
        <nav className="nav">
          {navItems.map(([key, label, Icon]) => (
            <button key={key} className={page === key ? "nav-item active" : "nav-item"} onClick={() => setPage(key)} title={label}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-status">
          <Shield size={20} />
          <div>
            <strong>All Systems Operational</strong>
            <span>Updated 30 seconds ago</span>
          </div>
        </div>
        <SidebarQuickActions page={page} setPage={setPage} onRange={applyTimeRange} onNotice={setNotice} />
        <button className="theme-toggle" onClick={() => setThemeMode(themeMode === "dark" ? "bright" : "dark")}>
          <Moon size={18} />
          <span>{themeMode === "dark" ? "Dark Mode" : "Bright Mode"}</span>
          <ChevronDown size={16} />
        </button>
      </aside>

      <main className="main">
        <header className="appbar">
          <button className="icon-button" title="Menu" onClick={() => setSidebarCollapsed((current) => !current)}>
            <Menu size={20} />
          </button>
          <div className="top-actions">
            <label className="search" aria-label="Search">
              <Search size={16} />
              <input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services, metrics, logs, traces..." />
              <kbd>Ctrl K</kbd>
            </label>
          </div>
          <div className="appbar-right">
            <div className="menu-wrap">
              <button className="icon-button notification-button" title="Notifications" onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}>
              <Bell size={18} />
              <span>12</span>
              </button>
              {openMenu === "notifications" && <NotificationMenu notifications={data.notifications} onViewAll={() => { setPage("notifications"); setOpenMenu(null); }} />}
            </div>
            <button className="icon-button slack-button" title="Slack" onClick={() => setNotice("Slack integration is connected to #platform-alerts")}><Slack size={18} /></button>
            <div className="menu-wrap">
              <button className="icon-button" title="Theme" onClick={() => setOpenMenu(openMenu === "theme" ? null : "theme")}><Moon size={18} /></button>
              {openMenu === "theme" && <BrightnessMenu themeMode={themeMode} setThemeMode={(mode) => { setThemeMode(mode); setOpenMenu(null); }} />}
            </div>
            <button className="icon-button" title="Help" onClick={() => setNotice("Help center opened for the current workspace")}><HelpCircle size={18} /></button>
            <button className="icon-button" title="Settings" onClick={() => setPage("settings")}><Settings size={18} /></button>
            <div className="menu-wrap">
            <button className="profile-chip profile-button" onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")} title="Profile menu">
              <span className="avatar"><UserRound size={18} /></span>
              <span className="profile-copy">
                <strong>Admin User</strong>
                <small>Administrator</small>
              </span>
              <ChevronDown size={15} />
            </button>
            {openMenu === "profile" && (
              <div className="floating-menu compact-menu align-right profile-menu">
                <button className="menu-option" onClick={() => { setNotice("Profile details loaded"); setOpenMenu(null); }}>View profile</button>
                <button className="menu-option" onClick={() => { setPage("settings"); setOpenMenu(null); }}>Account settings</button>
                <button className="menu-option danger-option" onClick={logout}>Sign out</button>
              </div>
            )}
            </div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            {["services", "metrics", "traces", "infrastructure"].includes(page) && (
              <div className="breadcrumb">
                <Home size={14} />
                <span>Home</span>
                <ChevronDown size={13} className="breadcrumb-separator" />
                <span>{activeLabel}</span>
              </div>
            )}
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>
          </div>
          <PageHeadingActions
            page={page}
            timeRange={timeRange}
            serviceScope={serviceScope}
            setServiceScope={setServiceScope}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            applyTimeRange={applyTimeRange}
            refresh={() => { refresh(); setNotice("Live data refreshed"); }}
            loading={loading}
            runPageAction={runPageAction}
          />
        </section>

        <Page page={page} data={data} query={query} timeRange={timeRange} serviceScope={serviceScope} setPage={setPage} onNotice={setNotice} />
      </main>
      {notice && <div className="action-toast"><CheckCircle2 size={18} /> {notice}</div>}
    </div>
  );
}

function PageHeadingActions({ page, timeRange, serviceScope, setServiceScope, openMenu, setOpenMenu, applyTimeRange, refresh, loading, runPageAction }) {
  if (page === "services") {
    return <button className="primary page-primary" onClick={() => runPageAction("add-service")}><Plus size={17} /> Add New Service</button>;
  }

  return (
    <div className="heading-actions">
      {page === "metrics" && (
        <select className="control-select" value={serviceScope} onChange={(event) => setServiceScope(event.target.value)}>
          <option>All Services</option>
          <option>api-gateway</option>
          <option>monitoring-service</option>
          <option>alert-service</option>
        </select>
      )}
      <div className="menu-wrap">
        <button className="range-button" onClick={() => setOpenMenu(openMenu === "range" ? null : "range")}>
          <Calendar size={16} /> {timeRange} <ChevronDown size={16} />
        </button>
        {openMenu === "range" && <TimeRangeMenu value={timeRange} onChange={applyTimeRange} />}
      </div>
      <button className="icon-button" onClick={refresh} title="Refresh"><RefreshCw size={17} className={loading ? "spin" : ""} /></button>
      {page === "metrics" && <button className="primary page-primary" onClick={() => runPageAction("add-metric")}><Plus size={17} /> Add Custom Metric</button>}
    </div>
  );
}

function SidebarQuickActions({ page, setPage, onRange, onNotice }) {
  const actionsByPage = {
    services: [
      ["Add Service", Plus, () => window.dispatchEvent(new CustomEvent("platform-page-action", { detail: "add-service" }))],
      ["Create Alert Rule", BellRing, () => setPage("alerts")],
      ["View Documentation", HelpCircle, () => onNotice("Service documentation opened")]
    ],
    traces: [
      ["View Service Map", GitBranch, () => setPage("traces")],
      ["Search Traces", Search, () => window.dispatchEvent(new CustomEvent("platform-page-action", { detail: "focus-trace-search" }))],
      ["Compare Performance", Gauge, () => setPage("metrics")],
      ["Analyze Dependencies", Network, () => window.dispatchEvent(new CustomEvent("platform-page-action", { detail: "trace-dependencies" }))]
    ],
    infrastructure: [
      ["Add Service", Plus, () => setPage("services")],
      ["Add Host", Server, () => onNotice("Host enrollment wizard opened")],
      ["Create Dashboard", LayoutDashboard, () => setPage("dashboard")],
      ["View Integrations", Network, () => setPage("settings")]
    ]
  };

  if (page === "metrics") {
    return (
      <div className="quick-actions quick-filters">
        <strong>Quick Filters</strong>
        {["Last 1 Hour", "Last 6 Hours", "Last 24 Hours", "Last 7 Days"].map((label) => (
          <button key={label} className={label === "Last 1 Hour" ? "active" : ""} onClick={() => onRange(label)}><Clock3 size={15} /><span>{label}</span></button>
        ))}
        <button onClick={() => onNotice("Custom date range picker opened")}><Calendar size={15} /><span>Custom Range</span></button>
      </div>
    );
  }

  const actions = actionsByPage[page];
  if (!actions) return <span className="version">v1.0.0</span>;

  return (
    <div className="quick-actions">
      <strong>Quick Actions</strong>
      {actions.map(([label, Icon, action]) => (
        <button key={label} onClick={action}>
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("admin@ops.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("Backend unavailable");
      const payload = await response.json();
      onLogin(payload.token);
    } catch {
      setError("Using local demo session");
      onLogin("demo-token");
    }
  }

  return (
    <main className="login-screen">
      <form className="login-panel" onSubmit={submit}>
        <div className="brand large">
          <span className="brand-mark"><Activity size={22} /></span>
          <span>Monitoring Platform</span>
        </div>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="primary" type="submit"><Lock size={17} /> Sign in</button>
        {error && <p className="form-note">{error}</p>}
      </form>
      <div className="login-art">
        <Network size={34} />
        <div>
          <h1>Observability Command Center</h1>
          <p>Metrics, traces, incidents, deployments, and notifications in one SRE workspace.</p>
        </div>
      </div>
    </main>
  );
}

function NotificationMenu({ notifications, onViewAll }) {
  return (
    <div className="floating-menu notifications-menu">
      <header>
        <strong>Notifications</strong>
        <StatusBadge value={`${notifications.length} sent`} />
      </header>
      {notifications.slice(0, 4).map((notification) => (
        <button className="notification-row" key={notification.notificationId} onClick={onViewAll}>
          <Bell size={16} />
          <span>
            <strong>{notification.message}</strong>
            <small>{notification.channel} - {notification.createdAt || "just now"}</small>
          </span>
        </button>
      ))}
      <button className="menu-action" onClick={onViewAll}>View notification center</button>
    </div>
  );
}

function BrightnessMenu({ themeMode, setThemeMode }) {
  return (
    <div className="floating-menu compact-menu">
      <header>
        <strong>Brightness</strong>
        <SlidersHorizontal size={16} />
      </header>
      {["dark", "dim", "bright"].map((mode) => (
        <button key={mode} className={themeMode === mode ? "menu-option active" : "menu-option"} onClick={() => setThemeMode(mode)}>
          {labelize(mode)}
        </button>
      ))}
    </div>
  );
}

function TimeRangeMenu({ value, onChange }) {
  return (
    <div className="floating-menu compact-menu align-right">
      <header>
        <strong>Time Range</strong>
        <Clock3 size={16} />
      </header>
      {timeRangeOptions.map((option) => (
        <button key={option.label} className={value === option.label ? "menu-option active" : "menu-option"} onClick={() => onChange(option.label)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Page({ page, data, query, timeRange, serviceScope, setPage, onNotice }) {
  switch (page) {
    case "infrastructure":
      return <Infrastructure data={data} query={query} onNotice={onNotice} />;
    case "services":
      return <ServicesPage data={data} query={query} setPage={setPage} onNotice={onNotice} />;
    case "metrics":
      return <MetricsPage data={data} timeRange={timeRange} serviceScope={serviceScope} onNotice={onNotice} />;
    case "logs":
      return <LogsPage data={data} query={query} />;
    case "kubernetes":
      return <Kubernetes data={data} query={query} timeRange={timeRange} />;
    case "traces":
      return <Traces data={data} onNotice={onNotice} />;
    case "alerts":
      return <Alerts data={data} query={query} />;
    case "incidents":
      return <Incidents data={data} query={query} />;
    case "reports":
      return <Reports data={data} />;
    case "notifications":
      return <Notifications data={data} query={query} />;
    case "settings":
      return <SettingsPage />;
    case "users":
      return <UsersPage data={data} query={query} />;
    default:
      return <Dashboard data={data} setPage={setPage} />;
  }
}

function Dashboard({ data, setPage }) {
  const overview = [
    { time: "10:00", cpu: 68, memory: 41, disk: 17 },
    { time: "10:05", cpu: 74, memory: 46, disk: 19 },
    { time: "10:10", cpu: 69, memory: 42, disk: 18 },
    { time: "10:15", cpu: 77, memory: 48, disk: 20 },
    { time: "10:20", cpu: 82, memory: 44, disk: 17 },
    { time: "10:25", cpu: 71, memory: 40, disk: 19 },
    { time: "10:30", cpu: 79, memory: 47, disk: 18 },
    { time: "10:35", cpu: 73, memory: 43, disk: 21 },
    { time: "10:40", cpu: 84, memory: 49, disk: 18 },
    { time: "10:45", cpu: 72, memory: 39, disk: 20 },
    { time: "10:50", cpu: 78, memory: 44, disk: 18 },
    { time: "10:55", cpu: 86, memory: 42, disk: 21 },
    { time: "11:00", cpu: 82, memory: 48, disk: 20 }
  ];
  const alertRows = [
    ["High CPU Usage", "monitoring-service", "Critical", "2m ago", "red"],
    ["Memory Usage High", "alert-service", "Warning", "5m ago", "amber"],
    ["Disk Space Low", "api-gateway", "Warning", "12m ago", "amber"],
    ["Service Response Time High", "notification-service", "Info", "15m ago", "blue"],
    ["Service Down", "auth-service", "Critical", "18m ago", "red"]
  ];
  return (
    <div className="dashboard-grid">
      <MetricCard icon={Boxes} label="Total Services" value="12" trend="2" tone="blue" />
      <MetricCard icon={Activity} label="Healthy Services" value="10" trend="1" tone="green" />
      <MetricCard icon={Siren} label="Active Alerts" value="12" trend="5" tone="amber" />
      <MetricCard icon={Network} label="Total Requests" value="8,547" trend="12.5%" tone="violet" />
      <MetricCard icon={Clock3} label="Avg. Response Time" value="245 ms" trend="8.3%" tone="blue" down />

      <Panel title="System Overview" className="span-3 dashboard-overview" actionLabel="View all metrics" onAction={() => setPage("metrics")}>
        <div className="chart-legend"><span><i className="dot blue" /> CPU Usage (%)</span><span><i className="dot violet" /> Memory Usage (%)</span><span><i className="dot green" /> Disk Usage (%)</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={overview}>
            <CartesianGrid strokeDasharray="3 3" stroke="#263241" />
            <XAxis dataKey="time" stroke="#8da1b5" />
            <YAxis stroke="#8da1b5" />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="cpu" stroke="#2388ff" fill="#2388ff2c" strokeWidth={2} />
            <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="#a855f71c" strokeWidth={2} />
            <Area type="monotone" dataKey="disk" stroke="#22c55e" fill="#22c55e12" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Services Status" className="span-2" actionLabel="View all services" onAction={() => setPage("services")}>
        <div className="reference-table service-status-table">
          <div className="reference-row reference-head"><span>Service Name</span><span>Status</span><span>Uptime</span><span>Response Time</span><span /></div>
          {data.services.map((service, index) => (
            <button className="reference-row" key={service.serviceName} onClick={() => setPage("services")}>
              <span>{service.serviceName}</span><span className={service.status === "Healthy" ? "ok-text" : "danger-text"}>● {service.status}</span><span>{service.uptime}</span><span>{service.responseTime}</span><SimpleSpark tone={service.status === "Healthy" ? "blue" : "red"} seed={index} /></button>
          ))}
        </div>
      </Panel>

      <Panel title="Active Alerts" actionLabel="View all alerts" onAction={() => setPage("alerts")}>
        <div className="compact-feed">
          {alertRows.map(([title, service, severity, time, tone]) => <button key={title} onClick={() => setPage("alerts")}><span className={`feed-icon ${tone}`}><AlertTriangle size={16} /></span><span><strong>{title}</strong><small>{service}</small></span><StatusBadge value={severity} /><time>{time}</time></button>)}
        </div>
      </Panel>

      <Panel title="Logs Overview" actionLabel="View all logs" onAction={() => setPage("logs")}>
        <div className="compact-feed log-feed">
          {data.logs.map((log) => <button key={`${log.time}-${log.message}`} onClick={() => setPage("logs")}><StatusBadge value={log.level} /><span><strong>{log.message}</strong><small>{log.service}</small></span><time>{log.time}</time></button>)}
        </div>
      </Panel>

      <Panel title="Infrastructure" actionLabel="View infrastructure" onAction={() => setPage("infrastructure")}>
        <div className="infra-donut-layout">
          <button className="donut-chart infrastructure-donut" onClick={() => setPage("infrastructure")}><span>Total Nodes<strong>5</strong></span></button>
          <div className="donut-legend"><span><i className="dot blue" /> Healthy <strong>3 (60%)</strong></span><span><i className="dot amber" /> Warning <strong>1 (20%)</strong></span><span><i className="dot red" /> Critical <strong>1 (20%)</strong></span></div>
        </div>
        <div className="infra-counts">
          <span>Total Pods <strong>28</strong></span>
          <span>Running <strong className="ok-text">25</strong></span>
          <span>Failed <strong className="danger-text">3</strong></span>
        </div>
      </Panel>
    </div>
  );
}

function ServicesPage({ data, query, setPage, onNotice }) {
  const baseServices = useMemo(() => [
    ...data.services.map((service) => ({ ...service, environment: "Production", updated: "1m ago" })),
    { serviceName: "user-service", status: "Warning", environment: "Staging", uptime: "97.45%", responseTime: "320 ms", requests: 664, updated: "2m ago" },
    { serviceName: "config-service", status: "Healthy", environment: "Staging", uptime: "99.80%", responseTime: "110 ms", requests: 410, updated: "3m ago" }
  ], [data.services]);
  const [services, setServices] = useState(baseServices);
  const [selectedName, setSelectedName] = useState("monitoring-service");
  const [serviceSearch, setServiceSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [environmentFilter, setEnvironmentFilter] = useState("All Environments");
  const [detailTab, setDetailTab] = useState("Overview");
  const [adding, setAdding] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  useEffect(() => {
    const listener = (event) => event.detail === "add-service" && setAdding(true);
    window.addEventListener("platform-page-action", listener);
    return () => window.removeEventListener("platform-page-action", listener);
  }, []);

  const rows = services.filter((service) => {
    const needle = `${query} ${serviceSearch}`.trim().toLowerCase();
    const matchesText = !needle || service.serviceName.toLowerCase().includes(needle);
    const matchesStatus = statusFilter === "All Status" || service.status === statusFilter;
    const matchesEnvironment = environmentFilter === "All Environments" || service.environment === environmentFilter;
    return matchesText && matchesStatus && matchesEnvironment;
  });
  const selected = services.find((service) => service.serviceName === selectedName) ?? services[0];
  const detailSeries = [168, 214, 175, 236, 182, 248, 205, 279, 191, 224, 203, 260].map((value, index) => ({ time: `${10 + Math.floor(index / 2)}:${index % 2 ? "30" : "00"}`, value }));

  function addService(event) {
    event.preventDefault();
    const name = newServiceName.trim();
    if (!name) return;
    const service = { serviceName: name, status: "Healthy", environment: "Staging", uptime: "100%", responseTime: "0 ms", requests: 0, updated: "just now" };
    setServices((current) => [...current, service]);
    setSelectedName(name);
    setNewServiceName("");
    setAdding(false);
    onNotice(`${name} added to the service catalog`);
  }

  return (
    <div className="services-workspace">
      <div className="summary-grid five">
        <MetricCard icon={Boxes} label="Total Services" value={services.length} trend="2 new this week" />
        <MetricCard icon={Activity} label="Healthy" value={services.filter((service) => service.status === "Healthy").length} trend="75% of total" tone="green" />
        <MetricCard icon={AlertTriangle} label="Warning" value={services.filter((service) => service.status === "Warning").length} trend="12.5% of total" tone="amber" />
        <MetricCard icon={Siren} label="Critical" value="1" trend="12.5% of total" tone="red" />
        <MetricCard icon={Network} label="Avg. Uptime" value="99.92%" trend="0.15% vs last week" tone="violet" />
      </div>

      <div className="services-main-grid">
        <Panel title="All Services" className="service-catalog-panel">
          <div className="table-tools">
            <label className="inline-search"><Search size={15} /><input value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} placeholder="Search services..." /></label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All Status</option><option>Healthy</option><option>Warning</option><option>Unhealthy</option></select>
            <select value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}><option>All Environments</option><option>Production</option><option>Staging</option></select>
          </div>
          <div className="reference-table service-catalog-table">
            <div className="reference-row reference-head"><span>Service Name</span><span>Status</span><span>Environment</span><span>Uptime</span><span>Response Time</span><span>Last Updated</span><span /></div>
            {rows.map((service) => (
              <button className={`reference-row ${selectedName === service.serviceName ? "selected" : ""}`} key={service.serviceName} onClick={() => setSelectedName(service.serviceName)}>
                <span className="service-name-cell"><span className="mini-service-icon"><Activity size={13} /></span>{service.serviceName}</span>
                <span className={service.status === "Healthy" ? "ok-text" : service.status === "Warning" ? "warning-text" : "danger-text"}>● {service.status}</span>
                <span><StatusBadge value={service.environment} /></span><span>{service.uptime}</span><span>{service.responseTime}</span><span>{service.updated}</span><MoreVertical size={15} />
              </button>
            ))}
          </div>
          <div className="table-footer"><span>Showing 1 to {rows.length} of {services.length} services</span><div><button disabled>‹</button><button className="active">1</button><button disabled>›</button></div></div>
        </Panel>

        <Panel title="Service Details" className="service-details-panel" action={<select value={selectedName} onChange={(event) => setSelectedName(event.target.value)}>{services.map((service) => <option key={service.serviceName}>{service.serviceName}</option>)}</select>}>
          <nav className="detail-tabs">{["Overview", "Metrics", "Logs", "Traces", "Alerts", "Configurations"].map((tab) => <button key={tab} className={detailTab === tab ? "active" : ""} onClick={() => setDetailTab(tab)}>{tab}</button>)}</nav>
          {detailTab === "Overview" ? (
            <>
              <div className="mini-stat-grid">
                <MiniStat label="Uptime" value={selected.uptime} detail="Last 7 days" tone="green" />
                <MiniStat label="Response Time" value={selected.responseTime} detail="Average" tone="violet" />
                <MiniStat label="Requests" value="12.4K" detail="Last 1 hour" tone="blue" />
                <MiniStat label="Error Rate" value={selected.status === "Healthy" ? "0.02%" : "1.8%"} detail="Last 1 hour" tone="red" />
              </div>
              <div className="service-detail-charts">
                <div className="inner-chart"><header><strong>Response Time (ms)</strong><button onClick={() => onNotice("Response-time range updated")}>Last 1 hour⌄</button></header><ResponsiveContainer width="100%" height={160}><LineChart data={detailSeries}><CartesianGrid strokeDasharray="3 3" stroke="#233248" /><XAxis dataKey="time" stroke="#8396aa" /><YAxis stroke="#8396aa" /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="value" stroke="#2388ff" dot={false} /></LineChart></ResponsiveContainer></div>
                <div className="inner-chart"><header><strong>Requests by Status Code</strong><button onClick={() => onNotice("Status-code range updated")}>Last 1 hour⌄</button></header><div className="status-code-layout"><div className="donut-chart status-donut"><span><strong>12.4K</strong>Total</span></div><div className="donut-legend"><span><i className="dot green" />2xx (Success) <strong>11.2K (90.3%)</strong></span><span><i className="dot amber" />4xx (Client Error) <strong>1.1K (8.9%)</strong></span><span><i className="dot red" />5xx (Server Error) <strong>120 (0.8%)</strong></span></div></div></div>
              </div>
            </>
          ) : <DetailTabContent tab={detailTab} service={selected} onNavigate={setPage} />}
        </Panel>
      </div>

      <div className="service-bottom-grid">
        <Panel title="Recent Alerts" actionLabel="View all alerts" onAction={() => setPage("alerts")}><CompactAlertFeed onOpen={() => setPage("alerts")} /></Panel>
        <Panel title="Recent Logs" actionLabel="View all logs" onAction={() => setPage("logs")}><div className="compact-feed log-feed">{data.logs.map((log) => <button key={log.time} onClick={() => setPage("logs")}><StatusBadge value={log.level} /><span><strong>{log.message}</strong><small>{log.service}</small></span><time>{log.time}</time></button>)}</div></Panel>
        <Panel title="Active Traces" actionLabel="View all traces" onAction={() => setPage("traces")}><ActiveTraceFeed onOpen={() => setPage("traces")} /></Panel>
      </div>

      {adding && <Modal title="Add New Service" onClose={() => setAdding(false)}><form className="modal-form" onSubmit={addService}><label>Service name<input autoFocus value={newServiceName} onChange={(event) => setNewServiceName(event.target.value)} placeholder="orders-service" /></label><label>Environment<select><option>Staging</option><option>Production</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setAdding(false)}>Cancel</button><button className="primary" type="submit"><Plus size={16} /> Add Service</button></div></form></Modal>}
    </div>
  );
}

function MetricsPage({ timeRange, serviceScope, onNotice }) {
  const [metricSearch, setMetricSearch] = useState("");
  const [groupBy, setGroupBy] = useState("Group by: None");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [metricPage, setMetricPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [metricName, setMetricName] = useState("");
  const [customMetrics, setCustomMetrics] = useState([]);
  useEffect(() => {
    const listener = (event) => event.detail === "add-metric" && setAdding(true);
    window.addEventListener("platform-page-action", listener);
    return () => window.removeEventListener("platform-page-action", listener);
  }, []);
  const metricSeries = [
    { time: "10:20", requests: 470, p50: 82, p95: 280, p99: 155, errors: .04 },
    { time: "10:30", requests: 380, p50: 75, p95: 245, p99: 142, errors: .08 },
    { time: "10:40", requests: 640, p50: 91, p95: 330, p99: 166, errors: .12 },
    { time: "10:50", requests: 720, p50: 88, p95: 295, p99: 158, errors: .09 },
    { time: "11:00", requests: 590, p50: 94, p95: 350, p99: 172, errors: .18 },
    { time: "11:05", requests: 1080, p50: 105, p95: 505, p99: 295, errors: .67 },
    { time: "11:10", requests: 520, p50: 79, p95: 310, p99: 148, errors: .05 }
  ];
  const metricRows = [
    ["http_requests_total", "api-gateway", "Counter", "52,143", "867 req/s", "645 req/s", "1,234 req/s", "blue"],
    ["http_request_duration_seconds", "monitoring-service", "Histogram", "0.245 s", "0.210 s", "0.120 s", "0.560 s", "violet"],
    ["jvm_memory_usage_bytes", "alert-service", "Gauge", "512 MB", "498 MB", "256 MB", "768 MB", "green"],
    ["cpu_usage_percent", "notification-service", "Gauge", "43.6%", "41.2%", "21.3%", "78.9%", "green"],
    ["active_connections", "dashboard-ui", "Gauge", "1,234", "1,089", "678", "1,890", "blue"],
    ...customMetrics.map((name) => [name, serviceScope, "Gauge", "0", "0", "0", "0", "violet"])
  ].filter((row) => row[0].toLowerCase().includes(metricSearch.toLowerCase()));

  function addMetric(event) {
    event.preventDefault();
    if (!metricName.trim()) return;
    setCustomMetrics((current) => [...current, metricName.trim()]);
    onNotice(`${metricName.trim()} added to Metrics Explorer`);
    setMetricName("");
    setAdding(false);
  }

  return (
    <div className="metrics-workspace">
      <div className="summary-grid six">
        <MetricCard icon={Network} label="Total Requests" value="52.1K" trend="12.5%" />
        <MetricCard icon={BarChart3} label="Error Rate" value="0.02%" trend="8.3%" tone="violet" down />
        <MetricCard icon={Clock3} label="P95 Response Time" value="245 ms" trend="15.6%" tone="green" down />
        <MetricCard icon={Activity} label="Throughput" value="867 req/s" trend="18.7%" tone="amber" />
        <MetricCard icon={Users} label="Active Connections" value="1,234" trend="5.4%" tone="cyan" />
        <MetricCard icon={Gauge} label="CPU Usage (Avg)" value="43.6%" trend="6.2%" tone="orange" down />
      </div>

      <div className="metrics-chart-grid">
        <Panel title="Request Rate" info><ChartLegend items={[["Total Requests", "blue"]]} /><ResponsiveContainer width="100%" height={200}><AreaChart data={metricSeries}><CartesianGrid strokeDasharray="3 3" stroke="#223248" /><XAxis dataKey="time" stroke="#8496aa" /><YAxis stroke="#8496aa" /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="requests" stroke="#2388ff" fill="#2388ff25" /></AreaChart></ResponsiveContainer></Panel>
        <Panel title="Response Time (ms)" info><ChartLegend items={[["P50", "green"], ["P95", "violet"], ["P99", "amber"]]} /><ResponsiveContainer width="100%" height={200}><LineChart data={metricSeries}><CartesianGrid strokeDasharray="3 3" stroke="#223248" /><XAxis dataKey="time" stroke="#8496aa" /><YAxis stroke="#8496aa" /><Tooltip content={<ChartTooltip />} /><Line type="monotone" dataKey="p50" stroke="#22c55e" dot={false} /><Line type="monotone" dataKey="p95" stroke="#a855f7" dot={false} /><Line type="monotone" dataKey="p99" stroke="#fbbf24" dot={false} /></LineChart></ResponsiveContainer></Panel>
        <Panel title="Error Rate (%)" info><ChartLegend items={[["Error Rate", "red"]]} /><ResponsiveContainer width="100%" height={200}><AreaChart data={metricSeries}><CartesianGrid strokeDasharray="3 3" stroke="#223248" /><XAxis dataKey="time" stroke="#8496aa" /><YAxis stroke="#8496aa" /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#ef444416" /></AreaChart></ResponsiveContainer></Panel>
      </div>

      <div className="metrics-insight-grid">
        <Panel title="Top Services by Request Rate" info><RankedBars rows={[["api-gateway", 245, "blue"], ["monitoring-service", 198, "green"], ["alert-service", 156, "violet"], ["notification-service", 132, "amber"], ["dashboard-ui", 98, "cyan"]]} suffix="Requests/sec" /></Panel>
        <Panel title="Top Endpoints by Response Time (P95)" info><RankedBars rows={[["GET /api/metrics", 320, "violet"], ["POST /api/alerts", 280, "violet"], ["GET /api/services", 245, "violet"], ["GET /api/logs", 210, "violet"], ["GET /api/traces", 185, "violet"]]} suffix="Response Time" /></Panel>
        <Panel title="Resource Utilization" className="resource-gauge-panel" info><div className="gauge-grid"><GaugeRing label="CPU" value={43.6} tone="green" /><GaugeRing label="Memory" value={67.8} tone="orange" /><GaugeRing label="Disk" value={58.3} tone="amber" /><GaugeRing label="Network" value={32.1} tone="cyan" /></div></Panel>
      </div>

      <Panel title="Metrics Explorer" className="metrics-explorer" info action={<div className="explorer-tools"><label className="inline-search"><Search size={15} /><input value={metricSearch} onChange={(event) => setMetricSearch(event.target.value)} placeholder="Search metrics..." /></label><select value={groupBy} onChange={(event) => setGroupBy(event.target.value)}><option>Group by: None</option><option>Group by: Service</option><option>Group by: Type</option></select><label className="switch-label">Auto Refresh<input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} /><span /></label><button className="icon-button" title="Explorer settings" onClick={() => onNotice(`Metrics grouped with ${groupBy}`)}><Settings size={16} /></button></div>}>
        <div className="reference-table metrics-table"><div className="reference-row reference-head"><span>Metric Name</span><span>Service</span><span>Type</span><span>Current Value</span><span>Average</span><span>Min</span><span>Max</span><span>Trend</span></div>{metricRows.map((row, index) => <button className="reference-row" key={row[0]} onClick={() => onNotice(`${row[0]} selected`)}>{row.slice(0, 7).map((cell, cellIndex) => <span key={`${row[0]}-${cellIndex}`}>{cellIndex === 2 ? <StatusBadge value={cell} /> : cell}</span>)}<SimpleSpark tone={row[7]} seed={index} /></button>)}</div>
        <div className="table-footer"><span>Showing 1 to {metricRows.length} of {25 + customMetrics.length} metrics</span><div><button onClick={() => setMetricPage(Math.max(1, metricPage - 1))}>‹</button>{[1, 2, 3, 4, 5].map((number) => <button key={number} className={metricPage === number ? "active" : ""} onClick={() => setMetricPage(number)}>{number}</button>)}<button onClick={() => setMetricPage(Math.min(5, metricPage + 1))}>›</button></div></div>
      </Panel>

      {adding && <Modal title="Add Custom Metric" onClose={() => setAdding(false)}><form className="modal-form" onSubmit={addMetric}><label>Metric name<input autoFocus value={metricName} onChange={(event) => setMetricName(event.target.value)} placeholder="queue_depth_total" /></label><label>Metric type<select><option>Gauge</option><option>Counter</option><option>Histogram</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setAdding(false)}>Cancel</button><button className="primary" type="submit"><Plus size={16} /> Add Metric</button></div></form></Modal>}
    </div>
  );
}

function LogsPage({ data, query }) {
  const rows = filterRows(data.logs, query, ["level", "message", "service"]);
  return (
    <Panel title="Centralized Logs">
      <DataTable columns={["level", "message", "service", "time"]} rows={rows} />
    </Panel>
  );
}

function Infrastructure({ data, query, onNotice }) {
  const [resourceTab, setResourceTab] = useState("CPU");
  const [selectedCluster, setSelectedCluster] = useState("us-central-1");
  const [clusterFilter, setClusterFilter] = useState("All Clusters");
  const [zoom, setZoom] = useState(100);
  const clusters = [
    { name: "us-east-1", status: "Healthy", nodes: 4, pods: 52, x: 16, y: 35 },
    { name: "us-central-1", status: "Healthy", nodes: 6, pods: 72, x: 50, y: 32 },
    { name: "eu-west-1", status: "Healthy", nodes: 2, pods: 18, x: 83, y: 36 },
    { name: "ap-southeast-1", status: "Warning", nodes: 0, pods: 0, x: 50, y: 73 }
  ];
  const resourceSeries = [48, 52, 44, 55, 49, 38, 51, 46, 54, 43, 58, 52].map((value, index) => ({ time: `${index * 2}:00`, value: resourceTab === "CPU" ? value : resourceTab === "Memory" ? value + 16 : resourceTab === "Disk" ? value + 8 : Math.max(18, value - 15) }));
  const nodes = [
    { name: "ip-10-0-1-23", status: "Ready", cpu: "32%", memory: "45%", pods: 23, uptime: "12d 4h" },
    { name: "ip-10-0-1-24", status: "Ready", cpu: "68%", memory: "71%", pods: 28, uptime: "12d 4h" },
    { name: "ip-10-0-1-25", status: "Ready", cpu: "41%", memory: "34%", pods: 18, uptime: "12d 4h" },
    { name: "ip-10-0-2-11", status: "Ready", cpu: "25%", memory: "22%", pods: 12, uptime: "9d 18h" },
    { name: "ip-10-0-2-12", status: "Not Ready", cpu: "92%", memory: "89%", pods: 0, uptime: "-" }
  ].filter((node) => node.name.includes(query));
  const pods = [
    { name: "monitoring-service-7d5f8c6d9b-abc12", namespace: "monitoring", status: "Running", restarts: 0 },
    { name: "alert-service-5f6b7d8f9c-def34", namespace: "monitoring", status: "Running", restarts: 1 },
    { name: "notification-service-6c7d8e9f0a-ghi56", namespace: "monitoring", status: "Running", restarts: 0 },
    { name: "api-gateway-6b7c8d9e0f-jkl78", namespace: "default", status: "Running", restarts: 0 },
    { name: "dashboard-ui-5c6d7e8f9g-mno90", namespace: "default", status: "Running", restarts: 0 }
  ];
  const events = [
    ["Scaled up deployment monitoring-service", "Deployment: monitoring/monitoring-service", "2m ago", "green"],
    ["Node ip-10-0-1-23 is ready", "Node became ready", "5m ago", "green"],
    ["High memory usage on ip-10-0-1-24", "Memory usage is above 80%", "12m ago", "amber"],
    ["New pod created: alert-service-5f6b7d8f9c-def34", "Pod is running", "15m ago", "blue"],
    ["Failed to pull image for dashboard-ui", "ImagePullBackOff", "18m ago", "red"]
  ];
  return (
    <div className="infrastructure-workspace">
      <div className="summary-grid five">
        <MetricCard icon={Server} label="Total Nodes" value="12" trend="2 vs yesterday" />
        <MetricCard icon={Boxes} label="Total Pods" value="156" trend="18 vs yesterday" tone="green" />
        <MetricCard icon={Gauge} label="CPU Usage" value="43.6%" trend="6.2% vs yesterday" tone="violet" down />
        <MetricCard icon={Activity} label="Memory Usage" value="67.8%" trend="4.1% vs yesterday" tone="amber" down />
        <MetricCard icon={Database} label="Disk Usage" value="58.3%" trend="3.7% vs yesterday" tone="cyan" down />
      </div>

      <div className="infra-main-grid">
        <Panel title="Cluster Map" info action={<div className="cluster-tools"><select value={clusterFilter} onChange={(event) => setClusterFilter(event.target.value)}><option>All Clusters</option><option>Healthy</option><option>Warning</option></select><button onClick={() => setZoom(Math.max(75, zoom - 25))}>−</button><span>{zoom}%</span><button onClick={() => setZoom(Math.min(150, zoom + 25))}>+</button><button onClick={() => setZoom(100)}><Focus size={15} /></button></div>}>
          <div className="cluster-map" style={{ "--map-scale": zoom / 100 }}>
            <div className="world-dots" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M22 39 L43 36" /><path d="M57 36 L76 39" /><path d="M50 43 L50 64" /></svg>
            {clusters.filter((cluster) => clusterFilter === "All Clusters" || cluster.status === clusterFilter).map((cluster) => <button key={cluster.name} className={`cluster-node ${cluster.status.toLowerCase()} ${selectedCluster === cluster.name ? "selected" : ""}`} style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }} onClick={() => setSelectedCluster(cluster.name)}><strong>● {cluster.name}</strong><span>● {cluster.status}</span><small>{cluster.nodes} nodes</small><small>{cluster.pods} pods</small></button>)}
          </div>
        </Panel>

        <Panel title="Resource Usage" info action={<select value={clusterFilter} onChange={(event) => setClusterFilter(event.target.value)}><option>All Clusters</option>{clusters.map((cluster) => <option key={cluster.name}>{cluster.name}</option>)}</select>}>
          <nav className="detail-tabs resource-tabs">{["CPU", "Memory", "Disk", "Network"].map((tab) => <button key={tab} className={resourceTab === tab ? "active" : ""} onClick={() => setResourceTab(tab)}>{tab}</button>)}</nav>
          <ResponsiveContainer width="100%" height={210}><AreaChart data={resourceSeries}><CartesianGrid strokeDasharray="3 3" stroke="#223248" /><XAxis dataKey="time" stroke="#8496aa" /><YAxis stroke="#8496aa" domain={[0, 100]} /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="value" stroke="#a855f7" fill="#a855f72a" /></AreaChart></ResponsiveContainer>
          <div className="resource-stats"><span>Average<strong>{resourceSeries[0].value}.6%</strong></span><span>Maximum<strong>78.9%</strong></span><span>Minimum<strong>12.4%</strong></span><span>Current<strong className="violet-text">{resourceSeries.at(-1).value}.6%</strong></span></div>
        </Panel>
      </div>

      <div className="infra-bottom-grid">
        <Panel title="Nodes" info actionLabel="View all nodes" onAction={() => onNotice("All nodes loaded")}><div className="reference-table infra-table"><div className="reference-row reference-head"><span>Name</span><span>Status</span><span>CPU</span><span>Memory</span><span>Pods</span><span>Uptime</span></div>{nodes.map((node) => <button className="reference-row" key={node.name} onClick={() => onNotice(`${node.name} selected`)}><span>{node.name}</span><span className={node.status === "Ready" ? "ok-text" : "danger-text"}>● {node.status}</span><span>{node.cpu}</span><span>{node.memory}</span><span>{node.pods}</span><span>{node.uptime}</span></button>)}</div></Panel>
        <Panel title="Pods" info actionLabel="View all pods" onAction={() => onNotice("All pods loaded")}><div className="reference-table pod-table"><div className="reference-row reference-head"><span>Name</span><span>Namespace</span><span>Status</span><span>Restarts</span></div>{pods.map((pod) => <button className="reference-row" key={pod.name} onClick={() => onNotice(`${pod.name} selected`)}><span>{pod.name}</span><span>{pod.namespace}</span><StatusBadge value={pod.status} /><span>{pod.restarts}</span></button>)}</div></Panel>
        <Panel title="Recent Events" info actionLabel="View all events" onAction={() => onNotice("Event stream opened")}><div className="event-feed">{events.map(([title, detail, time, tone]) => <button key={title} onClick={() => onNotice(title)}><span className={`feed-icon ${tone}`}><Info size={15} /></span><span><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></button>)}</div></Panel>
      </div>
    </div>
  );
}

function Kubernetes({ data, query, timeRange }) {
  const pods = filterRows(data.pods, query, ["namespaceName", "deploymentName", "podName", "status"]);
  const podStatus = Object.entries(data.kube.podStatusDistribution ?? {}).map(([name, value]) => ({ name, value }));
  const podTotal = podStatus.reduce((sum, item) => sum + item.value, 0);
  const resourceData = [
    { time: "15:00", cpu: 42, memory: 60, network: 24 },
    { time: "15:15", cpu: 55, memory: 35, network: 28 },
    { time: "15:30", cpu: 48, memory: 31, network: 22 },
    { time: "15:45", cpu: 64, memory: 38, network: 27 },
    { time: "16:00", cpu: 62, memory: 36, network: 31 }
  ];
  const deployments = [
    { name: "monitoring-service", status: "Healthy", ready: "3/3", upToDate: 3, available: 3, age: "12d" },
    { name: "alert-service", status: "Healthy", ready: "2/2", upToDate: 2, available: 2, age: "12d" },
    { name: "notification-service", status: "Healthy", ready: "2/2", upToDate: 2, available: 2, age: "12d" },
    { name: "api-gateway", status: "Healthy", ready: "3/3", upToDate: 3, available: 3, age: "12d" },
    { name: "dashboard-ui", status: "Healthy", ready: "2/2", upToDate: 2, available: 2, age: "11d" }
  ];
  const events = [
    { time: "May 20, 2024 16:05:23", type: "Normal", reason: "ScaledUp", object: "Deployment/monitoring-service", message: "Scaled up replica set monitoring-service to 3" },
    { time: "May 20, 2024 16:02:11", type: "Warning", reason: "Unhealthy", object: "Pod/alert-service", message: "Liveness probe failed with statuscode: 500" },
    { time: "May 20, 2024 16:00:45", type: "Normal", reason: "Pulled", object: "Pod/notification-service", message: "Successfully pulled image notification-service:1.2.0" }
  ];
  return (
    <div className="kubernetes-grid">
      <MetricCard icon={Server} label="Nodes" value="5" trend="Healthy" tone="blue" />
      <MetricCard icon={Boxes} label="Pods" value={`${data.kube.readyReplicas + 78} / 110`} trend="Running" tone="violet" />
      <MetricCard icon={GitBranch} label="Deployments" value="16" trend="Healthy" tone="green" />
      <MetricCard icon={Gauge} label="CPU Usage" value="42.8%" trend="5.6%" tone="amber" down />
      <MetricCard icon={Activity} label="Memory Usage" value="68.3%" trend="3.2%" tone="violet" down />
      <MetricCard icon={Network} label="Network I/O" value="1.2 Gbps" trend="8.4%" tone="blue" />

      <Panel title="Cluster Health">
        <div className="cluster-health">
          <span className="health-hex"><CheckCircle2 size={42} /></span>
          <strong>Healthy</strong>
          <p>All systems are operational</p>
        </div>
      </Panel>

      <Panel title="Nodes" className="span-3">
        <DataTable columns={["name", "status", "cpu", "memory", "pods", "uptime"]} rows={[
          { name: "ip-10-0-1-10", status: "Ready", cpu: "32%", memory: "45%", pods: 21, uptime: "12d 4h" },
          { name: "ip-10-0-1-11", status: "Ready", cpu: "41%", memory: "62%", pods: 18, uptime: "12d 4h" },
          { name: "ip-10-0-1-12", status: "Ready", cpu: "28%", memory: "38%", pods: 16, uptime: "9d 18h" },
          { name: "ip-10-0-1-13", status: "Ready", cpu: "51%", memory: "71%", pods: 22, uptime: "12d 4h" },
          { name: "ip-10-0-1-14", status: "Ready", cpu: "36%", memory: "55%", pods: 10, uptime: "12d 4h" }
        ]} />
      </Panel>

      <Panel title={`Resource Utilization - ${timeRange}`} className="span-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={resourceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#263241" />
            <XAxis dataKey="time" stroke="#8da1b5" />
            <YAxis stroke="#8da1b5" />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="cpu" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="memory" stroke="#a855f7" strokeWidth={2} />
            <Line type="monotone" dataKey="network" stroke="#2f81f7" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Deployments" className="span-2">
        <DataTable columns={["name", "status", "ready", "upToDate", "available", "age"]} rows={deployments} />
      </Panel>

      <Panel title="Pods" className="span-2">
        <DataTable columns={["podName", "status", "nodeName", "restartCount"]} rows={pods} />
      </Panel>

      <Panel title="Pod Status" className="span-2">
        <div className="pod-status-layout">
          <ResponsiveContainer width="45%" height={220}>
            <PieChart>
              <Pie data={podStatus} dataKey="value" nameKey="name" innerRadius={54} outerRadius={86}>
                {podStatus.map((entry) => <Cell key={entry.name} fill={podColor(entry.name)} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pod-total"><strong>{podTotal}</strong><span>Total</span></div>
          <div className="legend-list">
            {podStatus.map((item) => (
              <span key={item.name}><i style={{ background: podColor(item.name) }} /> {labelize(item.name.toLowerCase())} <strong>{item.value}</strong></span>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Events" className="span-4">
        <DataTable columns={["time", "type", "reason", "object", "message"]} rows={events} />
      </Panel>
    </div>
  );
}

function Traces({ data, onNotice }) {
  const [viewTab, setViewTab] = useState("Service Map");
  const [mapMetric, setMapMetric] = useState("Request Rate");
  const [mapLayout, setMapLayout] = useState("grid");
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState("monitoring");
  const [traceQuery, setTraceQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTraceId, setSelectedTraceId] = useState("4f8e2c7a9b2d1e3f");
  const [detailTab, setDetailTab] = useState("Timeline");
  const [tracePage, setTracePage] = useState(1);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [jsonOpen, setJsonOpen] = useState(false);
  const traceSearchRef = useRef(null);
  const latencyLegend = [
    ["< 100ms", "green"],
    ["100-300ms", "blue"],
    ["300-500ms", "amber"],
    ["> 500ms", "red"]
  ];
  const mapNodes = [
    { id: "gateway", label: "API Gateway", requests: "867 req/s", latency: "98 ms", Icon: GitBranch, tone: "violet", x: 10, y: 45 },
    { id: "auth", label: "Auth Service", requests: "245 req/s", latency: "45 ms", Icon: Lock, tone: "green", x: 28, y: 18 },
    { id: "user", label: "User Service", requests: "320 req/s", latency: "67 ms", Icon: UserRound, tone: "blue", x: 28, y: 66 },
    { id: "monitoring", label: "Monitoring Service", requests: "867 req/s", latency: "120 ms", Icon: Activity, tone: "amber", x: 50, y: 45 },
    { id: "alert", label: "Alert Service", requests: "123 req/s", latency: "210 ms", Icon: BellRing, tone: "orange", x: 69, y: 18 },
    { id: "notification", label: "Notification Service", requests: "123 req/s", latency: "95 ms", Icon: Mail, tone: "green", x: 69, y: 66 },
    { id: "postgres", label: "PostgreSQL", requests: "120 req/s", latency: "35 ms", Icon: Database, tone: "violet", x: 91, y: 45 }
  ];
  const traceRows = [
    { id: "4f8e2c7a9b2d1e3f", service: "monitoring-service", duration: "245 ms", status: "OK", start: "11:12:45 AM" },
    { id: "7c3a9d1e2b4f8a6c", service: "alert-service", duration: "532 ms", status: "SLOW", start: "11:12:44 AM" },
    { id: "2e6d7f9a1b3c4e5d", service: "notification-service", duration: "98 ms", status: "OK", start: "11:12:43 AM" },
    { id: "9a1b2c3d4e5f6a7b", service: "user-service", duration: "175 ms", status: "OK", start: "11:12:42 AM" },
    { id: "1d2e3f4a5b6c7d8e", service: "monitoring-service", duration: "612 ms", status: "ERROR", start: "11:12:41 AM" },
    { id: "6b7c8d9e0f1a2b3c", service: "auth-service", duration: "87 ms", status: "OK", start: "11:12:40 AM" },
    { id: "3c4d5e6f7a8b9c0d", service: "api-gateway", duration: "132 ms", status: "OK", start: "11:12:39 AM" }
  ];
  const timelineRows = [
    { label: "API Gateway", Icon: GitBranch, tone: "violet", start: 0, width: 74, duration: "245 ms" },
    { label: "Auth Service", Icon: Lock, tone: "green", start: 3, width: 13, duration: "45 ms" },
    { label: "User Service", Icon: UserRound, tone: "blue", start: 10, width: 16, duration: "67 ms" },
    { label: "Monitoring Service", Icon: Activity, tone: "amber", start: 28, width: 30, duration: "120 ms" },
    { label: "Alert Service", Icon: BellRing, tone: "orange", start: 51, width: 34, duration: "210 ms" },
    { label: "Notification Service", Icon: Mail, tone: "green", start: 58, width: 22, duration: "95 ms" },
    { label: "PostgreSQL", Icon: Database, tone: "violet", start: 84, width: 11, duration: "35 ms" }
  ];
  const detailLegend = timelineRows.map(({ label, tone }) => [label, tone]);
  const serviceCount = Array.from(new Set(data.dependencies.flatMap((edge) => [edge.source, edge.target]))).length || 6;
  const selectedTrace = traceRows.find((trace) => trace.id === selectedTraceId) ?? traceRows[0];
  const filteredTraces = traceRows.filter((trace) => {
    const matchesQuery = `${trace.id} ${trace.service}`.toLowerCase().includes(traceQuery.toLowerCase());
    return matchesQuery && (statusFilter === "All" || trace.status === statusFilter);
  });

  useEffect(() => {
    function listener(event) {
      if (event.detail === "focus-trace-search") traceSearchRef.current?.focus();
      if (event.detail === "trace-dependencies") setViewTab("Dependencies");
    }
    window.addEventListener("platform-page-action", listener);
    return () => window.removeEventListener("platform-page-action", listener);
  }, []);

  function downloadTrace() {
    downloadText(`${selectedTrace.id}.json`, "application/json", JSON.stringify({ trace: selectedTrace, spans: timelineRows }, null, 2));
    onNotice("Trace JSON downloaded");
  }

  return (
    <div className="traces-workspace">
      <nav className="traces-tabs" aria-label="Tracing views">
        {["Service Map", "Trace List", "Trace Analytics", "Dependencies"].map((tab) => (
          <button key={tab} className={viewTab === tab ? "active" : ""} onClick={() => { setViewTab(tab); if (tab === "Trace List") window.setTimeout(() => traceSearchRef.current?.focus(), 0); }}>{tab}</button>
        ))}
      </nav>

      <section className={`trace-card service-map-card ${mapFullscreen ? "map-fullscreen" : ""}`}>
        <header className="trace-map-header">
          <div className="trace-title-row">
            <h2>{viewTab}</h2>
            <Info size={14} />
          </div>
          <select className="trace-select" value={mapMetric} onChange={(event) => setMapMetric(event.target.value)}><option>Request Rate</option><option>Latency</option><option>Error Rate</option></select>
          <div className="latency-legend">
            {latencyLegend.map(([label, tone]) => (
              <span key={label}><i className={`dot ${tone}`} /> {label}</span>
            ))}
          </div>
          <div className="trace-map-actions">
            <select className="trace-select wide" value={mapMetric} onChange={(event) => setMapMetric(event.target.value)}><option>Request Rate</option><option>Latency</option><option>Error Rate</option></select>
            <TraceToolbarButton title="Grid view" Icon={Grid2X2} active={mapLayout === "grid"} onClick={() => setMapLayout("grid")} />
            <TraceToolbarButton title="Columns view" Icon={Columns3} active={mapLayout === "columns"} onClick={() => setMapLayout("columns")} />
            <TraceToolbarButton title="Fullscreen" Icon={Maximize2} active={mapFullscreen} onClick={() => setMapFullscreen((current) => !current)} />
          </div>
        </header>

        {viewTab === "Trace Analytics" ? (
          <div className="trace-analytics-grid">
            <MiniStat label="Total Traces" value="52.1K" detail="Last 15 minutes" tone="blue" />
            <MiniStat label="Error Traces" value="124" detail="0.24% error rate" tone="red" />
            <MiniStat label="P95 Duration" value="245 ms" detail="Down 15.6%" tone="green" />
            <MiniStat label="Services" value="7" detail="All reporting" tone="violet" />
            <div className="trace-analytics-chart"><ResponsiveContainer width="100%" height={220}><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#223248" /><XAxis dataKey="time" stroke="#8496aa" /><YAxis stroke="#8496aa" /><Tooltip content={<ChartTooltip />} /><Area type="monotone" dataKey="latency" stroke="#8b5cf6" fill="#8b5cf625" /></AreaChart></ResponsiveContainer></div>
          </div>
        ) : viewTab === "Dependencies" ? (
          <div className="trace-dependencies-view"><DependencyMap edges={data.dependencies} /></div>
        ) : (
        <div className={`service-map-canvas ${mapLayout}`}>
          <svg className="service-map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker id="map-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" fill="#53657c" />
              </marker>
            </defs>
            <path d="M17 50 C21 50 22 28 26 28" />
            <path d="M17 50 C21 50 22 70 26 70" />
            <path d="M39 28 C44 28 45 50 48 50" />
            <path d="M39 70 C44 70 45 50 48 50" />
            <path d="M61 50 C65 50 65 28 68 28" />
            <path d="M61 50 C65 50 65 70 68 70" />
            <path className="dashed" d="M81 28 C86 28 84 50 89 50" />
            <path className="dashed" d="M81 70 C86 70 84 50 89 50" />
          </svg>
          {mapNodes.map(({ id, label, requests, latency, Icon, tone, x, y }) => (
            <button className={`service-map-node ${tone} ${selectedNode === id ? "selected" : ""}`} style={{ "--x": `${x}%`, "--y": `${y}%` }} key={id} onClick={() => { setSelectedNode(id); onNotice(`${label} selected in service map`); }}>
              <TraceIconBadge Icon={Icon} tone={tone} />
              <div>
                <strong>{label}</strong>
                <span>{mapMetric === "Request Rate" ? requests : mapMetric === "Latency" ? latency : `${id === "alert" ? "1.8" : "0.02"}% errors`}</span>
                <span>{latency}</span>
              </div>
            </button>
          ))}
        </div>
        )}
      </section>

      <div className="trace-bottom-grid">
        <section className="trace-card trace-list-card">
          <header className="trace-panel-heading">
            <h2>Trace List</h2>
          </header>
          <div className="trace-list-tools">
            <label className="trace-search">
              <Search size={15} />
              <input ref={traceSearchRef} value={traceQuery} onChange={(event) => setTraceQuery(event.target.value)} placeholder="Search trace by ID, service..." />
            </label>
            <select className="trace-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option><option>OK</option><option>SLOW</option><option>ERROR</option></select>
            <TraceToolbarButton title="More actions" Icon={MoreVertical} onClick={() => onNotice("Trace list actions opened")} />
          </div>
          <div className="trace-table-wrap">
            <table className="trace-table">
              <thead>
                <tr>
                  <th>Trace ID</th>
                  <th>Service</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Start Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraces.map((row) => (
                  <tr key={row.id} className={selectedTraceId === row.id ? "selected" : ""} onClick={() => setSelectedTraceId(row.id)} tabIndex={0} onKeyDown={(event) => event.key === "Enter" && setSelectedTraceId(row.id)}>
                    <td><span className="trace-link">{row.id}</span></td>
                    <td>{row.service}</td>
                    <td>{row.duration}</td>
                    <td><StatusBadge value={row.status} /></td>
                    <td>{row.start}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <footer className="trace-pagination">
            <span>Showing 1 to {filteredTraces.length} of 245 traces</span>
            <div>
              <button onClick={() => setTracePage(Math.max(1, tracePage - 1))}>&lt;</button>
              {[1, 2, 3, 4].map((page) => <button key={page} className={page === tracePage ? "active" : ""} onClick={() => setTracePage(page)}>{page}</button>)}
              <span>...</span>
              <button className={tracePage === 35 ? "active" : ""} onClick={() => setTracePage(35)}>35</button>
              <button onClick={() => setTracePage(Math.min(35, tracePage + 1))}>&gt;</button>
            </div>
          </footer>
        </section>

        <section className="trace-card trace-detail-card">
          <header className="trace-detail-header">
            <div className="trace-detail-title">
              <h2>Trace Details</h2>
              <span>{selectedTrace.id}</span>
              <StatusBadge value={selectedTrace.status} />
            </div>
            <div className="trace-detail-actions">
              <span>Duration: <strong>{selectedTrace.duration}</strong></span>
              <button className="trace-json" onClick={() => setJsonOpen(true)}>View JSON</button>
            </div>
          </header>

          <div className="trace-meta">
            <span>Start Time: <strong>May 20, 2024 11:12:45 AM</strong></span>
            <span>Services: <strong>{serviceCount}</strong></span>
            <span>Spans: <strong>18</strong></span>
          </div>

          <nav className="trace-detail-tabs" aria-label="Trace detail tabs">
            {["Timeline", "Spans", "Logs", "Tags", "Dependencies"].map((tab) => (
              <button key={tab} className={detailTab === tab ? "active" : ""} onClick={() => setDetailTab(tab)}>{tab}</button>
            ))}
          </nav>

          {detailTab === "Timeline" ? <div className="waterfall">
            <div className="waterfall-scale">
              <span />
              <div className="scale-markers">
                {[
                  ["0 ms", 0],
                  ["61 ms", 24],
                  ["122 ms", 49],
                  ["183 ms", 73],
                  ["245 ms", 98]
                ].map(([label, left]) => <span key={label} style={{ left: `${left}%` }}>{label}</span>)}
              </div>
            </div>

            <div className="waterfall-body">
              <svg className="waterfall-links" viewBox="0 0 100 260" preserveAspectRatio="none" aria-hidden="true">
                <path className="blue" d="M18 76 C22 76 21 102 27 102" />
                <path className="green" d="M55 129 C62 129 61 181 69 181" />
                <path className="orange" d="M86 155 C93 155 89 232 94 232" />
              </svg>
              {timelineRows.map(({ label, Icon, tone, start, width, duration }) => (
                <div className="waterfall-row" key={label}>
                  <div className="waterfall-service">
                    <TraceIconBadge Icon={Icon} tone={tone} small />
                    <span>{label}</span>
                  </div>
                  <div className="waterfall-track">
                    <span className={`span-bar ${tone}`} style={{ left: `${Math.min(92, start * timelineZoom)}%`, width: `${Math.min(96, width * timelineZoom)}%` }}>{duration}</span>
                  </div>
                </div>
              ))}
              <div className="timeline-tools" aria-label="Timeline controls">
                <TraceToolbarButton title="Zoom in" Icon={Plus} onClick={() => setTimelineZoom((current) => Math.min(1.4, current + 0.1))} />
                <TraceToolbarButton title="Zoom out" Icon={Minus} onClick={() => setTimelineZoom((current) => Math.max(0.7, current - 0.1))} />
                <TraceToolbarButton title="Fit timeline" Icon={Focus} onClick={() => setTimelineZoom(1)} />
                <TraceToolbarButton title="Download trace" Icon={Download} onClick={downloadTrace} />
              </div>
            </div>
          </div> : <TraceTabContent tab={detailTab} trace={selectedTrace} dependencies={data.dependencies} />}

          <div className="trace-detail-legend">
            {detailLegend.map(([label, tone]) => (
              <span key={label}><i className={`dot ${tone}`} /> {label}</span>
            ))}
          </div>
        </section>
      </div>
      {jsonOpen && <Modal title={`Trace ${selectedTrace.id}`} onClose={() => setJsonOpen(false)}><pre className="json-preview">{JSON.stringify({ trace: selectedTrace, spans: timelineRows }, null, 2)}</pre><div className="modal-actions"><button className="secondary-button" onClick={() => setJsonOpen(false)}>Close</button><button className="primary" onClick={downloadTrace}><Download size={16} /> Download JSON</button></div></Modal>}
    </div>
  );
}

function TraceTabContent({ tab, trace, dependencies }) {
  if (tab === "Dependencies") return <div className="trace-tab-panel"><DependencyMap edges={dependencies} /></div>;
  if (tab === "Logs") return <div className="trace-tab-panel trace-log-lines"><code>11:12:45.012 INFO gateway accepted request {trace.id}</code><code>11:12:45.089 INFO monitoring-service queried Prometheus</code><code>11:12:45.245 INFO request completed with {trace.status}</code></div>;
  if (tab === "Tags") return <div className="trace-tab-panel tag-cloud"><StatusBadge value="environment:production" /><StatusBadge value="region:us-central-1" /><StatusBadge value={`service:${trace.service}`} /><StatusBadge value="http.method:GET" /></div>;
  return <div className="trace-tab-panel"><DataTable columns={["serviceName", "operation", "durationMs", "error"]} rows={[{ serviceName: "api-gateway", operation: "GET /api/metrics", durationMs: 245, error: false }, { serviceName: trace.service, operation: "query", durationMs: 120, error: trace.status === "ERROR" }]} /></div>;
}

function TraceIconBadge({ Icon, tone, small = false }) {
  return (
    <span className={`trace-icon-badge ${tone} ${small ? "small" : ""}`}>
      <Icon size={small ? 15 : 26} />
    </span>
  );
}

function TraceToolbarButton({ title, Icon, active = false, onClick }) {
  return (
    <button className={active ? "trace-tool-button active" : "trace-tool-button"} title={title} aria-label={title} onClick={onClick}>
      <Icon size={16} />
    </button>
  );
}

function Alerts({ data, query }) {
  const rows = filterRows(data.alerts, query, ["ruleName", "target", "status", "severity"]);
  return (
    <div className="content-stack">
      <div className="metric-row">
        <MetricCard icon={Siren} label="Active" value={data.alertSummary.activeAlerts} tone="red" />
        <MetricCard icon={CheckCircle2} label="Acknowledged" value={data.alertSummary.acknowledgedAlerts} tone="amber" />
        <MetricCard icon={Shield} label="Resolved" value={data.alertSummary.resolvedAlerts} tone="green" />
      </div>
      <Panel title="Alert Queue">
        <DataTable columns={["severity", "status", "target", "ruleName", "observedValue", "threshold", "message"]} rows={rows} />
      </Panel>
    </div>
  );
}

function Incidents({ data, query }) {
  const rows = filterRows(data.incidents, query, ["title", "severity", "status", "assignedTo"]);
  return (
    <div className="content-stack">
      <div className="metric-row">
        <MetricCard icon={AlertTriangle} label="Open" value={data.alertSummary.openIncidents} tone="red" />
        <MetricCard icon={TerminalSquare} label="Investigating" value={data.alertSummary.investigatingIncidents} tone="amber" />
        <MetricCard icon={CheckCircle2} label="Resolved" value={data.alertSummary.resolvedIncidents} tone="green" />
      </div>
      <Panel title="Incident Board">
        <IncidentList incidents={rows} />
      </Panel>
    </div>
  );
}

function Reports({ data }) {
  const [downloaded, setDownloaded] = useState("");

  function exportReport(kind) {
    const message = downloadReport(kind, data);
    setDownloaded(message);
  }

  return (
    <div className="page-grid">
      <Panel title="CPU Trend" className="span-2">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#263241" />
            <XAxis dataKey="time" stroke="#8da1b5" />
            <YAxis stroke="#8da1b5" />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="cpu" stroke="#14b8a6" strokeWidth={2} />
            <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Export Center">
        <div className="export-list">
          <button className="export-button" onClick={() => exportReport("cpu")}><Download size={17} /> CPU report CSV</button>
          <button className="export-button" onClick={() => exportReport("incidents")}><Download size={17} /> Incident PDF</button>
          <button className="export-button" onClick={() => exportReport("uptime")}><Download size={17} /> Uptime summary</button>
          <button className="export-button secondary" onClick={() => exportReport("deployments")}><Download size={17} /> Deployment JSON</button>
        </div>
        {downloaded && <p className="action-confirmation">{downloaded}</p>}
      </Panel>
      <Panel title="Top Failing Services">
        <DataTable columns={["target", "ruleName", "severity", "status"]} rows={data.alerts} />
      </Panel>
    </div>
  );
}

function Notifications({ data, query }) {
  const rows = filterRows(data.notifications, query, ["channel", "severity", "status", "message"]);
  return (
    <Panel title="Notification Center">
      <DataTable columns={["channel", "severity", "status", "message"]} rows={rows} />
    </Panel>
  );
}

function SettingsPage() {
  const initial = {
    prometheus: true,
    zipkin: true,
    slack: true,
    approvals: true,
    retention: false,
    escalation: false
  };
  const [applied, setApplied] = useState(() => {
    const saved = localStorage.getItem("platform-settings");
    return saved ? JSON.parse(saved) : initial;
  });
  const [draft, setDraft] = useState(applied);
  const [confirming, setConfirming] = useState(false);
  const [saved, setSaved] = useState(false);
  const settings = [
    ["prometheus", "Prometheus scrape interval", "Collect service metrics every 15 seconds"],
    ["zipkin", "Zipkin sampling", "Trace every gateway request in development"],
    ["slack", "Slack channel", "Send critical incidents to #platform-alerts"],
    ["approvals", "Deployment approvals", "Require confirmation before production rollout"],
    ["retention", "Audit retention", "Keep audit trails for 180 days"],
    ["escalation", "Incident escalation", "Escalate unresolved incidents after 15 minutes"]
  ];

  function toggle(key) {
    setSaved(false);
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  }

  function applySettings() {
    localStorage.setItem("platform-settings", JSON.stringify(draft));
    setApplied(draft);
    setConfirming(false);
    setSaved(true);
  }

  return (
    <div className="content-stack">
      <div className="settings-grid">
        {settings.map(([key, label, detail]) => (
          <label className="setting-row" key={key}>
            <span><strong>{label}</strong><small>{detail}</small></span>
            <input type="checkbox" checked={draft[key]} onChange={() => toggle(key)} />
          </label>
        ))}
      </div>
      <div className="settings-actions">
        <button className="export-button secondary" onClick={() => { setDraft(applied); setSaved(false); }}>Reset</button>
        <button className="export-button" onClick={() => setConfirming(true)}><CheckCircle2 size={17} /> Apply Changes</button>
        {saved && <span className="action-confirmation">Settings applied and saved locally.</span>}
      </div>
      {confirming && (
        <div className="modal-backdrop">
          <div className="confirm-modal">
            <h2>Confirm Settings Update</h2>
            <p>These changes will update the active dashboard behavior and be persisted for this browser session.</p>
            <div className="modal-actions">
              <button className="export-button secondary" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="export-button" onClick={applySettings}>Confirm Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersPage({ data, query }) {
  const rows = filterRows(data.users, query, ["email", "fullName"]);
  return (
    <Panel title="Users and Roles">
      <DataTable columns={["fullName", "email", "roles", "enabled"]} rows={rows} />
    </Panel>
  );
}

function SimpleSpark({ tone = "blue", seed = 0 }) {
  const values = [12, 18, 15, 24, 17, 21, 14, 26, 19, 23, 16, 25].map((value, index) => value + ((seed + index) % 3) * 2);
  const points = values.map((value, index) => `${index * 7},${34 - value}`).join(" ");
  return <svg className={`simple-spark ${tone}`} viewBox="0 0 78 36" aria-label="Trend sparkline"><polyline points={points} /></svg>;
}

function MiniStat({ label, value, detail, tone }) {
  return <article className="mini-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small><SimpleSpark tone={tone} /></article>;
}

function DetailTabContent({ tab, service, onNavigate }) {
  const actions = {
    Metrics: ["Open Metrics Explorer", "metrics"],
    Logs: ["Open Centralized Logs", "logs"],
    Traces: ["Open Distributed Tracing", "traces"],
    Alerts: ["Open Alert Queue", "alerts"],
    Configurations: ["Open Service Settings", "settings"]
  };
  const [label, target] = actions[tab] ?? actions.Metrics;
  return <div className="detail-empty"><Activity size={34} /><strong>{service.serviceName} {tab}</strong><p>The {tab.toLowerCase()} view is connected to the shared observability workspace.</p><button className="primary" onClick={() => onNavigate(target)}>{label}</button></div>;
}

function CompactAlertFeed({ onOpen }) {
  const alerts = [
    ["High CPU Usage", "monitoring-service", "Critical", "2m ago"],
    ["Memory Usage High", "alert-service", "Warning", "5m ago"],
    ["Disk Space Low", "api-gateway", "Warning", "12m ago"],
    ["Service Response Time High", "notification-service", "Info", "15m ago"]
  ];
  return <div className="compact-feed">{alerts.map(([title, service, severity, time]) => <button key={title} onClick={onOpen}><span className={`feed-icon ${severity.toLowerCase()}`}><AlertTriangle size={16} /></span><span><strong>{title}</strong><small>{service}</small></span><StatusBadge value={severity} /><time>{time}</time></button>)}</div>;
}

function ActiveTraceFeed({ onOpen }) {
  const traces = [["GET", "GET /api/metrics", "4f2d8b7...", "120 ms"], ["POST", "POST /api/alerts", "7a3e9c1...", "200 ms"], ["GET", "GET /api/services", "9b8c3d2...", "80 ms"], ["PUT", "PUT /api/config", "2c6f4a9...", "350 ms"], ["DELETE", "DELETE /api/alerts/123", "1d7e6f5...", "110 ms"]];
  return <div className="active-trace-feed">{traces.map(([method, endpoint, id, duration]) => <button key={`${method}-${endpoint}`} onClick={onOpen}><StatusBadge value={method} /><span>{endpoint}</span><small>Trace ID: {id}</small><StatusBadge value={duration} /></button>)}</div>;
}

function ChartLegend({ items }) {
  return <div className="chart-legend floating">{items.map(([label, tone]) => <span key={label}><i className={`dot ${tone}`} />{label}</span>)}</div>;
}

function RankedBars({ rows, suffix }) {
  const [selected, setSelected] = useState(rows[0]?.[0]);
  const max = Math.max(...rows.map((row) => row[1]));
  return <div className="ranked-bars"><small>{suffix}</small>{rows.map(([label, value, tone]) => <button key={label} className={selected === label ? "selected" : ""} onClick={() => setSelected(label)}><span>{label}</span><i><b className={tone} style={{ width: `${(value / max) * 100}%` }} /></i><strong>{value}{suffix === "Response Time" ? " ms" : ""}</strong></button>)}</div>;
}

function GaugeRing({ label, value, tone }) {
  return <div className={`gauge-ring ${tone}`} style={{ "--gauge": `${value * 1.8}deg` }}><span>{label}</span><i><strong>{value}%</strong></i></div>;
}

function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="confirm-modal action-modal" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close modal">×</button></header>{children}</section></div>;
}

function MetricCard({ icon: Icon, label, value, trend = "2", tone = "blue", down = false }) {
  const descriptiveTrend = /vs|total|week|yesterday|healthy|running/i.test(String(trend));
  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={down ? "trend down" : "trend"}>{down ? "↓" : "↑"} {trend} {!descriptiveTrend && <em>vs last hour</em>}</small>
      </div>
      <span className="metric-icon"><Icon size={28} /></span>
    </article>
  );
}

function Panel({ title, children, className = "", actionLabel, onAction, action, info = false }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className={`panel ${className} ${collapsed ? "collapsed" : ""}`}>
      <header className="panel-header">
        <h2>{title} {info && <Info size={14} />}</h2>
        {action ?? (actionLabel ? <button className="panel-link" onClick={onAction}>{actionLabel} →</button> : <button className="panel-menu" title={collapsed ? "Expand" : "Collapse"} onClick={() => setCollapsed((current) => !current)}><ChevronDown size={16} /></button>)}
      </header>
      {!collapsed && children}
    </section>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{labelize(column)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? row.notificationId ?? row.hostName ?? row.podName ?? index}>
              {columns.map((column) => (
                <td key={column}>{renderCell(row[column])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IncidentList({ incidents }) {
  return (
    <div className="incident-list">
      {incidents.map((incident) => (
        <article className="incident-item" key={incident.id}>
          <StatusBadge value={incident.severity} />
          <div>
            <strong>{incident.title}</strong>
            <p>{incident.rootCause || "Root cause pending"}</p>
          </div>
          <span>{incident.assignedTo || "Unassigned"}</span>
          <StatusBadge value={incident.status} />
        </article>
      ))}
    </div>
  );
}

function DependencyMap({ edges }) {
  const services = useMemo(() => Array.from(new Set(edges.flatMap((edge) => [edge.source, edge.target]))), [edges]);
  return (
    <div className="dependency-map">
      {services.map((service) => (
        <span className="service-node" key={service}>{service}</span>
      ))}
      <div className="edge-list">
        {edges.map((edge) => (
          <div className="edge-row" key={`${edge.source}-${edge.target}`}>
            <span>{edge.source}</span>
            <span className="edge-line" />
            <span>{edge.target}</span>
            <StatusBadge value={`${edge.p95LatencyMs} ms`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const text = String(value ?? "");
  const lowered = text.toLowerCase();
  const tone = lowered.includes("critical") || lowered.includes("active") || lowered.includes("crash") || lowered.includes("open") || lowered.includes("unhealthy") || lowered.includes("error") ? "danger"
    : lowered.includes("high") || lowered.includes("ack") || lowered.includes("investigating") || lowered.includes("warn") || lowered.includes("slow") ? "warning"
      : lowered.includes("running") || lowered.includes("resolved") || lowered.includes("sent") || lowered.includes("healthy") || lowered.includes("info") ? "ok"
        : "neutral";
  return <span className={`badge ${tone}`}>{text}</span>;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => <span key={item.dataKey ?? item.name}>{item.name}: {item.value}</span>)}
    </div>
  );
}

function downloadReport(kind, data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  if (kind === "cpu") {
    const csv = [
      "host,environment,cpuUsage,memoryUsage,diskUsage,available",
      ...data.hosts.map((host) => [host.hostName, host.environment, host.cpuUsage, host.memoryUsage, host.diskUsage, host.available].join(","))
    ].join("\n");
    downloadText(`cpu-report-${timestamp}.csv`, "text/csv", csv);
    return "CPU report downloaded.";
  }

  if (kind === "incidents") {
    const lines = [
      "Incident Report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      ...data.incidents.flatMap((incident) => [
        `${incident.severity} - ${incident.title}`,
        `Status: ${incident.status}`,
        `Assigned: ${incident.assignedTo || "Unassigned"}`,
        `Root cause: ${incident.rootCause || "Pending"}`,
        ""
      ])
    ];
    downloadText(`incident-report-${timestamp}.pdf`, "application/pdf", createSimplePdf("Incident Report", lines));
    return "Incident PDF downloaded.";
  }

  if (kind === "uptime") {
    const csv = [
      "service,status,uptime,responseTime,requests",
      ...data.services.map((service) => [service.serviceName, service.status, service.uptime, service.responseTime, service.requests].join(","))
    ].join("\n");
    downloadText(`uptime-summary-${timestamp}.csv`, "text/csv", csv);
    return "Uptime summary downloaded.";
  }

  const json = JSON.stringify({
    generatedAt: new Date().toISOString(),
    deployments: data.services.map((service) => ({
      service: service.serviceName,
      status: service.status,
      requests: service.requests
    }))
  }, null, 2);
  downloadText(`deployment-report-${timestamp}.json`, "application/json", json);
  return "Deployment JSON downloaded.";
}

function downloadText(filename, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function createSimplePdf(title, lines) {
  const safeLines = lines.slice(0, 34).map((line) => String(line).replace(/[()\\]/g, " "));
  const textCommands = safeLines.map((line, index) => `BT /F1 12 Tf 50 ${760 - index * 20} Td (${line}) Tj ET`).join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${textCommands.length} >> stream\n${textCommands}\nendstream endobj`
  ];
  let pdf = `%PDF-1.4\n% ${title}\n`;
  const offsets = [0];
  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

function podColor(status) {
  const colors = {
    RUNNING: "#22c55e",
    PENDING: "#f59e0b",
    FAILED: "#ef4444",
    SUCCEEDED: "#2f81f7",
    CRASH_LOOP_BACK_OFF: "#ef4444"
  };
  return colors[status] || "#8da1b5";
}

function filterRows(rows, query, fields) {
  if (!query.trim()) return rows;
  const needle = query.toLowerCase();
  return rows.filter((row) => fields.some((field) => String(row[field] ?? "").toLowerCase().includes(needle)));
}

function renderCell(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(1);
  if (typeof value === "string" && ["ACTIVE", "ACKNOWLEDGED", "RESOLVED", "CRITICAL", "HIGH", "MEDIUM", "LOW", "RUNNING", "CRASH_LOOP_BACK_OFF", "SENT", "Healthy", "Unhealthy", "INFO", "WARN", "ERROR"].includes(value)) {
    return <StatusBadge value={value} />;
  }
  return value ?? "";
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (match) => match.toUpperCase());
}

export default App;
