package com.observability.alert.api;

import com.observability.alert.api.dto.IncidentDto;
import com.observability.alert.api.dto.IncidentTimelineDto;
import com.observability.alert.api.dto.IncidentUpdateRequest;
import com.observability.alert.service.AlertManagementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/incidents")
public class IncidentController {

    private final AlertManagementService alertManagementService;

    public IncidentController(AlertManagementService alertManagementService) {
        this.alertManagementService = alertManagementService;
    }

    @GetMapping
    public List<IncidentDto> incidents() {
        return alertManagementService.incidents();
    }

    @GetMapping("/{incidentId}/timeline")
    public List<IncidentTimelineDto> timeline(@PathVariable UUID incidentId) {
        return alertManagementService.timeline(incidentId);
    }

    @PostMapping("/{incidentId}/assign")
    public IncidentDto assign(@PathVariable UUID incidentId, @Valid @RequestBody IncidentUpdateRequest request) {
        return alertManagementService.assign(incidentId, request.value(), request.actor());
    }

    @PostMapping("/{incidentId}/root-cause")
    public IncidentDto rootCause(@PathVariable UUID incidentId, @Valid @RequestBody IncidentUpdateRequest request) {
        return alertManagementService.rootCause(incidentId, request.value(), request.actor());
    }

    @PostMapping("/{incidentId}/resolve")
    public IncidentDto resolve(@PathVariable UUID incidentId, @Valid @RequestBody IncidentUpdateRequest request) {
        return alertManagementService.resolveIncident(incidentId, request.value(), request.actor());
    }
}
