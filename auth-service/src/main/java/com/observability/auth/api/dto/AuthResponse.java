package com.observability.auth.api.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record AuthResponse(
        String token,
        String tokenType,
        OffsetDateTime expiresAt,
        UserSummary user,
        List<String> permissions
) {
}
