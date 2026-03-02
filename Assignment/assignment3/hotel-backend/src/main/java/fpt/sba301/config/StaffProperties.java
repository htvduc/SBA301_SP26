package fpt.sba301.config;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "staff")
@Getter
@Setter
public class StaffProperties {
    private String email;
    private String password;
}
