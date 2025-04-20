package com.example.demo.utils;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import com.example.demo.entity.User;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JwtUtil {
    @Value("${jwt.privateKey}")
    String privateKey;

    @Value("${jwt.token-duration}")
    int duration;

    public ResponseData generateToken(User user) {
        if (user == null || user.getRole() == null) {
            return ResponseData.error("Invalid user");
        }

        Date now = new Date();
        Date expiration = new Date(now.getTime() + duration * 1000L);
        String role = user.getRole().toString();

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(now)
                .expirationTime(expiration)
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", role)
                .build();

        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(privateKey.getBytes(StandardCharsets.UTF_8)));
            String token = jwsObject.serialize();

            return ResponseData.success("Generated token successfully", token);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    public ResponseData validateToken(String token) {
        try {
            if (token == null || token.isEmpty()) {
                return ResponseData.error("Token is empty");
            }

            JWSVerifier verifier = new MACVerifier(privateKey.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(verifier)) {
                return ResponseData.error("Invalid JWT");
            }

            JWTClaimsSet jwtClaimsSet = signedJWT.getJWTClaimsSet();
            Date expiration = jwtClaimsSet.getExpirationTime();
            Date now = new Date();
            if (expiration.before(now)) {
                return ResponseData.error("Expired JWT");
            }

            String username = jwtClaimsSet.getSubject();
            if (username == null || username.isEmpty()) {
                return ResponseData.error("Username is empty");
            }

            return ResponseData.success("Token is valid", signedJWT);

        } catch (ParseException | JOSEException e) {
            return ResponseData.error(e.getMessage());
        }
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("authToken")) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    public ResponseData introspect(HttpServletRequest request) {
        try {
            String token = extractToken(request);
            return validateToken(token);
        } catch (Exception e) {
            return ResponseData.error(e.getMessage());
        }
    }

    public UsernamePasswordAuthenticationToken getAuthentication(String token) {
        try {
            if (token.split("\\.").length == 5) {
                log.info("JWE");
            }
            SignedJWT signedJWT = SignedJWT.parse(token);

            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            String username = claimsSet.getSubject();
            String scope = claimsSet.getClaim("scope").toString();
            List<GrantedAuthority> authorities = new ArrayList<>();
            if ("ADMIN".equals(scope)) {
                authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            } else if ("STAFF".equals(scope)) {
                authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));
            } else {
                authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
            }
            return new UsernamePasswordAuthenticationToken(username, null, authorities);
        } catch (Exception e) {
            return null;
        }
    }
}
