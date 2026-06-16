package com.observability.auth.config;

import com.observability.auth.domain.PlatformUser;
import com.observability.auth.domain.Role;
import com.observability.auth.repository.PlatformUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.LinkedHashSet;
import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedUsers(PlatformUserRepository repository, PasswordEncoder passwordEncoder) {
        return args -> {
            seed(repository, passwordEncoder, "admin@ops.local", "Avery Admin", "admin123", Role.ADMIN);
            seed(repository, passwordEncoder, "devops@ops.local", "Devin DevOps", "devops123", Role.DEVOPS_ENGINEER);
            seed(repository, passwordEncoder, "sre@ops.local", "Sam SRE", "sre123", Role.SRE_ENGINEER);
            seed(repository, passwordEncoder, "viewer@ops.local", "Vera Viewer", "viewer123", Role.VIEWER);
        };
    }

    private static void seed(
            PlatformUserRepository repository,
            PasswordEncoder passwordEncoder,
            String email,
            String fullName,
            String password,
            Role role
    ) {
        if (!repository.existsByEmailIgnoreCase(email)) {
            repository.save(new PlatformUser(
                    email,
                    fullName,
                    passwordEncoder.encode(password),
                    new LinkedHashSet<>(Set.of(role))
            ));
        }
    }
}
