package com.studybuddy.controller;

import com.studybuddy.entity.Student;
import com.studybuddy.exception.ApiException;
import com.studybuddy.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentRepository repo;

    public StudentController(StudentRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Student> all() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Student one(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() ->
                new ApiException("Student not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Student create(@Valid @RequestBody Student student) {
        if (repo.existsByEmail(student.getEmail())) {
            throw new ApiException("Email already exists", HttpStatus.CONFLICT);
        }
        return repo.save(student);
    }

    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @Valid @RequestBody Student input) {
        Student s = one(id);
        if (!s.getEmail().equals(input.getEmail()) && repo.existsByEmail(input.getEmail())) {
            throw new ApiException("Email already exists", HttpStatus.CONFLICT);
        }
        s.setName(input.getName());
        s.setEmail(input.getEmail());
        s.setDepartment(input.getDepartment());
        return repo.save(s);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Student s = one(id);
        repo.delete(s);
    }
}
