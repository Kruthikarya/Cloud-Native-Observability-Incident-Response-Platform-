package com.observability.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Gateway Configuration
 * Defines routing rules for all microservices
 */
@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Auth Service Routes
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("authServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/auth")))
                        .uri("lb://auth-service"))
                
                // Monitoring Service Routes
                .route("monitoring-service", r -> r
                        .path("/api/monitoring/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("monitoringServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/monitoring")))
                        .uri("lb://monitoring-service"))
                
                // Alert Service Routes
                .route("alert-service", r -> r
                        .path("/api/alerts/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("alertServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/alerts")))
                        .uri("lb://alert-service"))
                
                // Notification Service Routes
                .route("notification-service", r -> r
                        .path("/api/notifications/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("notificationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/notifications")))
                        .uri("lb://notification-service"))

                // Incident Management Routes
                .route("incident-service", r -> r
                        .path("/api/incidents/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("incidentServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/incidents")))
                        .uri("lb://alert-service"))

                // Reports and Analytics Routes
                .route("reports-service", r -> r
                        .path("/api/reports/**")
                        .filters(f -> f
                                .stripPrefix(1)
                                .circuitBreaker(c -> c
                                        .setName("monitoringServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/reports")))
                        .uri("lb://monitoring-service"))
                
                .build();
    }
}
