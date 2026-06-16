package com.observability.notification.repository;

import com.observability.notification.domain.Notification;
import com.observability.notification.domain.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findTop200ByOrderByCreatedAtDesc();

    long countByStatus(NotificationStatus status);
}
