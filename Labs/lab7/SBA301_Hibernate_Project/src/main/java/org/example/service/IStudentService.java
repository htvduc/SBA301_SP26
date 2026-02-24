package org.example.service;

import org.example.pojos.Student;

import java.util.List;

public interface IStudentService {

    // Các thao tác chính (CRUD)
    void save(Student student);
    void update(Student student);
    void delete(Student student);

    // Các thao tác đọc (Read)
    Student findById(int studentId);
    Student findByEmail(String email);
    List<Student> findAll();
}
