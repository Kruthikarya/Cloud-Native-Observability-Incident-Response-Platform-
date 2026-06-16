package com.observability.auth.service;

import com.observability.auth.api.dto.AuthResponse;
import com.observability.auth.api.dto.LoginRequest;
import com.observability.auth.api.dto.UserSummary;
import com.observability.auth.domain.PlatformUser;
import com.observability.auth.repository.PlatformUserRepository;
import com.observability.auth.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final PlatformUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PermissionCatalog permissionCatalog;

    public AuthService(
            PlatformUserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PermissionCatalog permissionCatalog
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.permissionCatalog = permissionCatalog;
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        PlatformUser user = userRepository.findByEmailIgnoreCase(request.email())
                .filter(PlatformUser::isEnabled)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        user.recordLogin();
        return new AuthResponse(
                jwtService.issue(user),
                "Bearer",
                jwtService.expiresAt(),
                UserSummary.from(user),
                permissionCatalog.permissionsFor(user.getRoles())
        );
    }
}
