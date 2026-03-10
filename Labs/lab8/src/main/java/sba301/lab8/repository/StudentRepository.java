package sba301.lab8.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import sba301.lab8.pojo.Student;

@Repository
public interface StudentRepository extends MongoRepository<Student, String> {
    Student findByEmail(String email);
}
