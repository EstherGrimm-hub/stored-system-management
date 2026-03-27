package com.stored.storedsystemmanagement.security;

import com.stored.storedsystemmanagement.entity.RoleType;
import com.stored.storedsystemmanagement.entity.User;
import com.stored.storedsystemmanagement.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class StoreAccessFilter extends OncePerRequestFilter {

    private final StoreRepository storeRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof User)) {
            filterChain.doFilter(request, response);
            return;
        }

        User user = (User) auth.getPrincipal();

        // ADMIN has global access
        if (user.getRole() == RoleType.ADMIN) {
            filterChain.doFilter(request, response);
            return;
        }

        // Always allow authentication API calls
        if (request.getRequestURI().startsWith("/api/v1/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // USER role: Check if they have store access
        if (user.getRole() == RoleType.USER) {
            Long storeId = resolveStoreId(request);
            if (storeId != null && user.getStore() != null) {
                if (!storeId.equals(user.getStore().getId())) {
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "Không có quyền truy cập cửa hàng này.");
                    return;
                }
            }
            filterChain.doFilter(request, response);
            return;
        }

        // Other roles not supported
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Vai trò không được hỗ trợ.");
    }

    private Long resolveStoreId(HttpServletRequest request) {
        String header = request.getHeader("X-Store-Id");
        if (StringUtils.hasText(header)) {
            try {
                return Long.parseLong(header);
            } catch (NumberFormatException ignored) {
            }
        }

        String param = request.getParameter("storeId");
        if (StringUtils.hasText(param)) {
            try {
                return Long.parseLong(param);
            } catch (NumberFormatException ignored) {
            }
        }

        return null;
    }
}
