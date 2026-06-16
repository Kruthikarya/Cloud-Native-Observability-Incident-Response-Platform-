package com.observability.alert.api.dto;

import jakarta.validation.constraints.NotBlank;

public record IncidentUpdateRequest(
        @NotBlank String value,
        String actor
) {
}
