package com.observability.auth.api.dto;

import com.observability.auth.domain.PlatformUser;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record UserSummary(
        UUID id,
        String email,
        String fullName,
        Set<String> roles,
        boolean enabled,
        OffsetDateTime createdAt,
        OffsetDateTime lastLoginAt
) {
    public static UserSummary from(PlatformUser user) {
        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toCollection(java.util.LinkedHashSet::new)),
                user.isEnabled(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );
    }
}
