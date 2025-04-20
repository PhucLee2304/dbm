package com.example.demo.security;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.ResponseData;

@Component
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.privateKey}")
    private String privateKey;

    private final JwtUtil jwtUtil;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    public CustomJwtDecoder(final JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Jwt decode(String token) {
        try {
            if (token == null || token.isEmpty()) {
                throw new JwtException("Token is empty");
            }

            ResponseData responseData = jwtUtil.validateToken(token);
            if (!responseData.isSuccess()) {
                throw new JwtException(responseData.getMessage());
            }

            if (nimbusJwtDecoder == null) {
                SecretKeySpec secretKeySpec = new SecretKeySpec(privateKey.getBytes(), "HS512");
                nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                        .macAlgorithm(MacAlgorithm.HS512)
                        .build();
            }

            return nimbusJwtDecoder.decode(token);
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            throw new JwtException(e.getMessage());
        }
    }
}
