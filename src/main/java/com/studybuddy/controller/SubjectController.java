package com.studybuddy.controller;

import com.studybuddy.entity.Subject;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.SubjectRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {
    private final SubjectRepository repo;

    public SubjectController(SubjectRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Subject> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Subject one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() ->
                new ApiException("Subject not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Subject create(@Valid @RequestBody Subject subject) {
        if (repo.findByName(subject.getName()).isPresent()) {
            throw new ApiException("Subject already exists", HttpStatus.CONFLICT);
        }
        return repo.save(subject);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repo.delete(one(id));
    }
}
