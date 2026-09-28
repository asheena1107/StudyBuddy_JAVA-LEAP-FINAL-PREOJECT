package com.studybuddy.repository;

import com.studybuddy.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    boolean existsByStudentIdAndGroupId(Long studentId, Long groupId);
    long countByGroupId(Long groupId);
    List<Membership> findByGroupId(Long groupId);
    List<Membership> findByStudentId(Long studentId);
}
