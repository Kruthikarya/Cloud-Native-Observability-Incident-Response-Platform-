package com.observability.alert.repository;

import com.observability.alert.domain.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {

    List<AlertRule> findByEnabledTrueOrderBySeverityAscNameAsc();

    boolean existsByNameIgnoreCase(String name);
}
