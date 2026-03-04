package sba301.fpt.pojos;

import jakarta.persistence.*;

@Entity
@Table(name = "AccountMember")
public class AccountMember {
    @Id
    @Column(name = "MemberID", length = 20)
    private String memberId;

    @Column(name = "MemberPassword", nullable = false, length = 80)
    private String memberPassword;

    @Column(name = "EmailAddress", unique = true, length = 100)
    private String emailAddress;

    @Column(name = "MemberRole")
    private Integer memberRole;

    public AccountMember() {
    }

    public AccountMember(String memberId, String memberPassword, String emailAddress, Integer memberRole) {
        this.memberId = memberId;
        this.memberPassword = memberPassword;
        this.emailAddress = emailAddress;
        this.memberRole = memberRole;
    }

    public String getMemberId() {
        return memberId;
    }

    public void setMemberId(String memberId) {
        this.memberId = memberId;
    }

    public String getMemberPassword() {
        return memberPassword;
    }

    public void setMemberPassword(String memberPassword) {
        this.memberPassword = memberPassword;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public Integer getMemberRole() {
        return memberRole;
    }

    public void setMemberRole(Integer memberRole) {
        this.memberRole = memberRole;
    }
}
