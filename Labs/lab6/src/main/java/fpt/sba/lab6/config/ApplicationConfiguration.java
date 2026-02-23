package fpt.sba.lab6.config;

import fpt.sba.lab6.repositories.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;


@Configuration
public class ApplicationConfiguration {

    // Repository dùng để lấy user từ database
    private final UserRepository userRepository;

    // Constructor injection (best practice)
    public ApplicationConfiguration(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * UserDetailsService
     *
     * Spring Security sẽ gọi method này khi cần load user để authenticate.
     * Ở đây dùng email làm username.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * PasswordEncoder
     *
     * Dùng BCrypt để mã hóa và so sánh mật khẩu.
     * Khi login, Spring Security sẽ tự so sánh
     * password raw với password đã encode trong DB.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AuthenticationProvider
     *
     * DaoAuthenticationProvider là provider chuẩn để authenticate
     * bằng UserDetailsService + PasswordEncoder.
     *
     * Lưu ý: Spring Security 6 KHÔNG còn dùng setter setUserDetailsService(),
     * mà truyền UserDetailsService qua constructor.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider =
                new DaoAuthenticationProvider(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AuthenticationManager
     *
     * AuthenticationManager chịu trách nhiệm xử lý authenticate().
     * Spring tự build AuthenticationManager từ AuthenticationProvider ở trên.
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
