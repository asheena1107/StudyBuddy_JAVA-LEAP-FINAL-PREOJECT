package com.studybuddy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "memberships",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "group_id"}))
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(optional = false)
    @JoinColumn(name = "group_id")
    private StudyGroup group;

    @Column(nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public Membership() {}

    public Membership(Student student, StudyGroup group) {
        this.student = student;
        this.group = group;
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public StudyGroup getGroup() { return group; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setId(Long id) { this.id = id; }
    public void setStudent(Student student) { this.student = student; }
    public void setGroup(StudyGroup group) { this.group = group; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
