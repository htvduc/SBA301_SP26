package org.example.service;

import org.example.pojos.Student;
import org.example.repository.IStudentRepository;
import org.example.repository.StudentRepository;

import java.util.List;

public class StudentService implements IStudentService {

    // Sử dụng Interface (IStudentRepository) là Best Practice.
    // Trong Lab này, chúng ta khởi tạo trực tiếp Repository Implementation.
    private IStudentRepository studentRepository = new StudentRepository();

    // --- Phương thức SAVE (CREATE) ---
    @Override
    public void save(Student student) {
        // 1. Logic Nghiệp vụ: Kiểm tra Email trùng lặp
        Student existingStudent = studentRepository.findByEmail(student.getEmail());
        if (existingStudent != null) {
            // Ném ra Exception nếu quy tắc nghiệp vụ bị vi phạm
            throw new RuntimeException("Lỗi Nghiệp vụ: Email '" + student.getEmail() + "' đã được đăng ký.");
        }

        // 2. Logic Nghiệp vụ: Kiểm tra điểm (marks) phải hợp lệ
        if (student.getMarks() == null || student.getMarks() < 0 || student.getMarks() > 10) {
            throw new IllegalArgumentException("Lỗi Dữ liệu: Điểm sinh viên phải nằm trong khoảng từ 0.0 đến 10.0.");
        }

        // 3. Gọi xuống tầng Repository để thực hiện lưu trữ (Persistence)
        studentRepository.save(student);
    }

    // --- Phương thức FIND ALL (READ ALL) ---
    @Override
    public List<Student> findAll() {
        // Logic đơn giản: chỉ cần gọi và chuyển tiếp kết quả từ Repository
        return studentRepository.findAll();
    }


    // --- Phương thức FIND BY ID (READ ONE) ---
    @Override
    public Student findById(int studentId) {
        // Có thể thêm logic kiểm tra ID có hợp lệ không trước khi tìm kiếm
        if (studentId <= 0) {
            throw new IllegalArgumentException("ID sinh viên không hợp lệ.");
        }
        return studentRepository.findById(studentId);
    }

    // --- Phương thức FIND BY EMAIL (READ ONE) ---
    @Override
    public Student findByEmail(String email) {
        // Có thể thêm logic kiểm tra format Email ở đây
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống.");
        }
        return studentRepository.findByEmail(email);
    }

    // --- Phương thức UPDATE ---
    @Override
    public void update(Student student) {
        // Logic Nghiệp vụ phức tạp hơn:
        // 1. Đảm bảo sinh viên đó đã tồn tại trong DB
        Student existing = studentRepository.findById(student.getId());
        if (existing == null) {
            throw new RuntimeException("Lỗi Nghiệp vụ: Không tìm thấy sinh viên có ID: " + student.getId() + " để cập nhật.");
        }

        // 2. Kiểm tra email mới (nếu thay đổi) không trùng với người khác
        Student studentWithNewEmail = studentRepository.findByEmail(student.getEmail());
        if (studentWithNewEmail != null && studentWithNewEmail.getId() != student.getId()) {
            throw new RuntimeException("Lỗi Nghiệp vụ: Email này đã được sử dụng bởi sinh viên khác.");
        }

        // 3. Kiểm tra hợp lệ điểm
        if (student.getMarks() == null || student.getMarks() < 0 || student.getMarks() > 10) {
            throw new IllegalArgumentException("Lỗi Dữ liệu: Điểm sinh viên phải nằm trong khoảng từ 0.0 đến 10.0.");
        }

        studentRepository.update(student);
    }

    // --- Phương thức DELETE ---
    @Override
    public void delete(Student student) {
        // Logic nghiệp vụ: Có thể kiểm tra sinh viên đó có đang mượn sách không trước khi xóa
        // (Giả sử Entity Student có phương thức getBooks() trả về danh sách sách mượn)
        if (student.getBooks() != null && !student.getBooks().isEmpty()) {
            throw new RuntimeException("Lỗi Nghiệp vụ: Không thể xóa sinh viên này vì họ vẫn đang mượn sách.");
        }
        studentRepository.delete(student);
    }
}
