package com.studybuddy.controller;

import com.studybuddy.entity.Membership;
import com.studybuddy.entity.Student;
import com.studybuddy.entity.StudyGroup;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.MembershipRepository;
import com.studybuddy.repository.StudentRepository;
import com.studybuddy.repository.StudyGroupRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {
    private final MembershipRepository membershipRepo;
    private final StudentRepository studentRepo;
    private final StudyGroupRepository groupRepo;

    public MembershipController(MembershipRepository membershipRepo,
                                StudentRepository studentRepo,
                                StudyGroupRepository groupRepo) {
        this.membershipRepo = membershipRepo;
        this.studentRepo = studentRepo;
        this.groupRepo = groupRepo;
    }

    @GetMapping
    public List<Membership> all() { return membershipRepo.findAll(); }

    @PostMapping("/join")
    @ResponseStatus(HttpStatus.CREATED)
    public Membership join(@RequestParam Long studentId, @RequestParam Long groupId) {
        Student student = studentRepo.findById(studentId).orElseThrow(() ->
                new ApiException("Student not found", HttpStatus.NOT_FOUND));
        StudyGroup group = groupRepo.findById(groupId).orElseThrow(() ->
                new ApiException("Study group not found", HttpStatus.NOT_FOUND));

        if (membershipRepo.existsByStudentIdAndGroupId(studentId, groupId)) {
            throw new ApiException("Student is already a member of this group", HttpStatus.CONFLICT);
        }

        if (membershipRepo.countByGroupId(groupId) >= group.getCapacity()) {
            throw new ApiException("Group capacity is full", HttpStatus.CONFLICT);
        }

        return membershipRepo.save(new Membership(student, group));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@PathVariable Long id) {
        if (!membershipRepo.existsById(id)) {
            throw new ApiException("Membership not found", HttpStatus.NOT_FOUND);
        }
        membershipRepo.deleteById(id);
    }
}
