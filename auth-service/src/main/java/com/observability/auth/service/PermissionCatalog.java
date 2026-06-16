package com.observability.auth.service;

import com.observability.auth.domain.Role;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Component
public class PermissionCatalog {

    private static final Map<Role, List<String>> PERMISSIONS = new LinkedHashMap<>();

    static {
        PERMISSIONS.put(Role.ADMIN, List.of(
                "monitoring:read", "alerts:write", "incidents:write", "deployments:write",
                "users:write", "settings:write", "reports:export"
        ));
        PERMISSIONS.put(Role.DEVOPS_ENGINEER, List.of(
                "monitoring:read", "alerts:write", "deployments:write", "reports:export"
        ));
        PERMISSIONS.put(Role.SRE_ENGINEER, List.of(
                "monitoring:read", "traces:read", "logs:read", "incidents:write", "alerts:write"
        ));
        PERMISSIONS.put(Role.VIEWER, List.of("monitoring:read", "alerts:read", "incidents:read"));
    }

    public List<String> permissionsFor(Set<Role> roles) {
        return roles.stream()
                .flatMap(role -> PERMISSIONS.getOrDefault(role, List.of()).stream())
                .distinct()
                .sorted()
                .toList();
    }
}
