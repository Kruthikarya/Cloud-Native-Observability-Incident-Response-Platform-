package com.observability.auth.security;

import com.observability.auth.domain.PlatformUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final SecretKey key;
    private final Duration ttl;

    public JwtService(
            @Value("${security.jwt.secret:change-me-to-a-very-long-256-bit-secret-key}") String secret,
            @Value("${security.jwt.ttl:PT8H}") Duration ttl
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.ttl = ttl;
    }

    public String issue(PlatformUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(ttl);
        List<String> roles = user.getRoles().stream().map(Enum::name).toList();

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("name", user.getFullName())
                .claim("roles", roles)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public OffsetDateTime expiresAt() {
        return OffsetDateTime.ofInstant(Instant.now().plus(ttl), ZoneOffset.UTC);
    }
}
