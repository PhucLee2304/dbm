package com.example.demo.security;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.demo.utils.JwtUtil;
import com.example.demo.utils.ResponseData;
import com.nimbusds.jwt.SignedJWT;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        ResponseData responseData = jwtUtil.introspect(request);
        if (responseData.isSuccess()) {
            SignedJWT signedJWT = (SignedJWT) responseData.getData();
            String token = signedJWT.serialize();
            UsernamePasswordAuthenticationToken authenticationToken = jwtUtil.getAuthentication(token);
            if (authenticationToken != null) {
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            } else {
                logger.error("Authentication failed for user: "
                        + authenticationToken.getPrincipal().toString());
            }
        }

        filterChain.doFilter(request, response);
    }
}
