package com.observability.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Fallback Controller
 * Provides fallback responses when services are unavailable
 */
@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authFallback() {
        return createFallbackResponse("Auth Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/monitoring")
    public ResponseEntity<Map<String, Object>> monitoringFallback() {
        return createFallbackResponse("Monitoring Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> alertsFallback() {
        return createFallbackResponse("Alert Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> notificationsFallback() {
        return createFallbackResponse("Notification Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/incidents")
    public ResponseEntity<Map<String, Object>> incidentsFallback() {
        return createFallbackResponse("Incident APIs are currently unavailable. Please try again later.");
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> reportsFallback() {
        return createFallbackResponse("Reporting APIs are currently unavailable. Please try again later.");
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("error", "Service Unavailable");
        response.put("message", message);
        response.put("fallback", true);
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
