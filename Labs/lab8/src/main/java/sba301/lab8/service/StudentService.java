package sba301.lab8.service;

import sba301.lab8.pojo.Student;

import java.util.List;

public interface StudentService {
    List<Student> getAllStudents();
    Student getStudentById(String id);
    void saveStudent(Student student);
    void deleteStudent(String id);
    boolean existsByEmail(String email);
}
