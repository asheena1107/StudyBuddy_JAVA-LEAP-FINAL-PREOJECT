package com.studybuddy.controller;

import com.studybuddy.entity.StudyGroup;
import com.studybuddy.entity.Subject;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.MembershipRepository;
import com.studybuddy.repository.StudyGroupRepository;
import com.studybuddy.repository.SubjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {
    private final StudyGroupRepository groupRepo;
    private final SubjectRepository subjectRepo;
    private final MembershipRepository membershipRepo;

    public StudyGroupController(StudyGroupRepository groupRepo,
                                SubjectRepository subjectRepo,
                                MembershipRepository membershipRepo) {
        this.groupRepo = groupRepo;
        this.subjectRepo = subjectRepo;
        this.membershipRepo = membershipRepo;
    }

    @GetMapping
    public List<StudyGroup> all() { return groupRepo.findAll(); }

    @GetMapping("/{id}")
    public StudyGroup one(@PathVariable Long id) {
        return groupRepo.findById(id).orElseThrow(() ->
                new ApiException("Study group not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudyGroup create(@Valid @RequestBody GroupRequest request) {
        Subject subject = subjectRepo.findById(request.subjectId())
                .orElseThrow(() -> new ApiException("Subject not found", HttpStatus.NOT_FOUND));
        return groupRepo.save(new StudyGroup(
                request.name(), request.description(), request.capacity(), subject));
    }

    @PutMapping("/{id}")
    public StudyGroup update(@PathVariable Long id, @Valid @RequestBody GroupRequest request) {
        StudyGroup group = one(id);
        long members = membershipRepo.countByGroupId(id);
        if (request.capacity() < members) {
            throw new ApiException("Capacity cannot be less than current members", HttpStatus.CONFLICT);
        }
        Subject subject = subjectRepo.findById(request.subjectId())
                .orElseThrow(() -> new ApiException("Subject not found", HttpStatus.NOT_FOUND));
        group.setName(request.name());
        group.setDescription(request.description());
        group.setCapacity(request.capacity());
        group.setSubject(subject);
        return groupRepo.save(group);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        groupRepo.delete(one(id));
    }

    @GetMapping("/{id}/members")
    public Object members(@PathVariable Long id) {
        one(id);
        return membershipRepo.findByGroupId(id);
    }

    public record GroupRequest(
            @jakarta.validation.constraints.NotBlank(message = "Group name is required") String name,
            @jakarta.validation.constraints.NotBlank(message = "Description is required") String description,
            @jakarta.validation.constraints.NotNull(message = "Capacity is required")
            @jakarta.validation.constraints.Positive(message = "Capacity must be greater than 0") Integer capacity,
            @jakarta.validation.constraints.NotNull(message = "Subject is required") Long subjectId
    ) {}
}
