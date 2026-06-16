package com.observability.auth.api;

import com.observability.auth.api.dto.AuthResponse;
import com.observability.auth.api.dto.LoginRequest;
import com.observability.auth.api.dto.UserSummary;
import com.observability.auth.repository.PlatformUserRepository;
import com.observability.auth.service.AuthService;
import com.observability.auth.service.PermissionCatalog;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PlatformUserRepository userRepository;
    private final PermissionCatalog permissionCatalog;

    public AuthController(AuthService authService, PlatformUserRepository userRepository, PermissionCatalog permissionCatalog) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.permissionCatalog = permissionCatalog;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public Map<String, Object> currentUser(Authentication authentication) {
        return userRepository.findByEmailIgnoreCase(authentication.getName())
                .map(user -> Map.<String, Object>of(
                        "user", UserSummary.from(user),
                        "permissions", permissionCatalog.permissionsFor(user.getRoles())
                ))
                .orElseThrow();
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummary> users() {
        return userRepository.findAll().stream()
                .map(UserSummary::from)
                .toList();
    }
}
