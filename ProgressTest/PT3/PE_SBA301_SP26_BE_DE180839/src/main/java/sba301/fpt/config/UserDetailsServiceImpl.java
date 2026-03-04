package sba301.fpt.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import sba301.fpt.pojos.AccountMember;
import sba301.fpt.repositories.AccountMemberRepository;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    private AccountMemberRepository accountMemberRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find by MemberID (ID) first
        AccountMember member = accountMemberRepository.findById(username)
                .orElseGet(() -> accountMemberRepository.findByEmailAddress(username)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                "User Not Found with username or email: " + username)));

        // Mapping MemberRole to Spring Security role
        // Assuming 1 = ADMIN, 2 = STAFF, 3 = MEMBER or similar.
        // I'll just use the numeric role as a suffix for now or map it if known.
        // If not specified, I'll just use ROLE_USER for all for now, or use the
        // integer.
        String roleName = "ROLE_" + member.getMemberRole();

        return new User(member.getMemberId(), member.getMemberPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(roleName)));
    }
}
