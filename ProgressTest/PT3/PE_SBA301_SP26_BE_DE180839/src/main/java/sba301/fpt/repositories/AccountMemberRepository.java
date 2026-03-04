package sba301.fpt.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import sba301.fpt.pojos.AccountMember;
import java.util.Optional;

public interface AccountMemberRepository extends JpaRepository<AccountMember, String> {
    Optional<AccountMember> findByEmailAddress(String emailAddress);
}
