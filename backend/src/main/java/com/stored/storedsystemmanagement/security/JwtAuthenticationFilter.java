package com.stored.storedsystemmanagement.security;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;
        
        // 1. Kiểm tra header xem có chứa Token bắt đầu bằng "Bearer " không
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
       // 2. Cắt lấy chuỗi Token (bỏ 7 ký tự "Bearer ")
        jwt = authHeader.substring(7);
        
        try {
            username = jwtService.extractUsername(jwt); // Trích xuất tên tài khoản từ Token
        } catch (Exception e) {
            // Nếu Token bị lỗi, hết hạn, hoặc sai chữ ký -> Cứ để họ đi tiếp như người ẩn danh
            // Spring Security sẽ tự động chặn họ lại ở các API cần quyền (tránh lỗi 500 sập server)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Nếu có tên tk và chưa được xác thực trong phiên hiện tại
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                // 4. Nếu Token chuẩn, cấp quyền đi tiếp
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // Lưu thông tin vào Security Context (tương tự như đóng dấu mộc cho qua cửa)
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // Nếu có lỗi trong quá trình xác thực, bỏ qua và tiếp tục như người ẩn danh
                // Tránh sập server do token lỗi
            }
        }
        filterChain.doFilter(request, response);
    }
}