package com.observability.auth.service;

import com.observability.auth.domain.Role;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class PermissionCatalogTest {

    @Test
    void adminReceivesOperationalAndUserPermissions() {
        PermissionCatalog catalog = new PermissionCatalog();

        assertThat(catalog.permissionsFor(Set.of(Role.ADMIN)))
                .contains("monitoring:read", "alerts:write", "users:write", "reports:export");
    }
}
