package org.example.dao;

import org.example.pojos.Student;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.hibernate.query.Query;

import org.hibernate.cfg.Configuration;
import java.util.List;

public class StudentDAO {
    private SessionFactory factory;//Khởi tạo SessionFactory từ file cấu hình hibernate.cfg.xml

    public StudentDAO(){
        try{
            Configuration cfg = new Configuration().configure("hibernate.cfg.xml");
            this.factory = cfg.buildSessionFactory();
        }
        catch(Exception e){
            System.err.println("Error intializing Session Factory"+ e.getMessage());
            e.printStackTrace();
        }
    }
    public void save(Student student){
        Session session = factory.openSession();
        Transaction tx= null;
        try{
            tx = session.beginTransaction();
            session.save(student);
            tx.commit();
        }
        catch (Exception e){
            if(tx!=null) tx.rollback();
            System.err.println("Error saving student: "+e.getMessage());
        }
        finally {
            session.close();
        }
    }
    public List<Student> getAll() {
        List<Student> students = null;
        Session session = factory.openSession();
        try {
            // Sử dụng HQL (Hibernate Query Language) để truy vấn đối tượng Entity
            Query<Student> query = session.createQuery("FROM Student", Student.class);
            //FROM Student là HQL, trong đó Student là tên của Entity Class, không phải tên bảng trong DB.
            students = query.list(); // Lấy danh sách kết quả
        } catch (Exception e) {
            System.err.println("Error getting all students: " + e.getMessage());
        } finally {
            session.close();
        }
        return students;
    }
    // READ ONE: Tìm một Student theo ID (Khóa chính)
    public Student getById(int id) {
        Student student = null;
        Session session = factory.openSession();
        try {
            // Phương thức get() của Hibernate/Session được dùng để tải Entity dựa trên ID.
            // Đây là cách đơn giản và phổ biến nhất để tải Entity theo khóa chính.
            student = session.get(Student.class, id);

            // Hoặc có thể dùng load(), nhưng get() là an toàn hơn vì nó trả về null nếu không tìm thấy.

        } catch (Exception e) {
            System.err.println("Error finding student by ID: " + e.getMessage());
        } finally {
            session.close();
        }
        return student;
    }
    // READ ONE: Tìm một Student theo email
    public Student findByEmail(String email) {
        Student student = null;
        Session session = factory.openSession();
        try {
            // HQL query với tham số (parameter)
            String hql = "FROM Student WHERE email = :email"; //Phương pháp sử dụng tham số (:email) giúp tránh lỗi SQL Injection.
            Query<Student> query = session.createQuery(hql, Student.class);
            query.setParameter("email", email);// Set giá trị cho tham số

            student = query.uniqueResult(); // Lấy kết quả duy nhất (vì email là unique)
        } catch (Exception e) {
            System.err.println("Error finding student by email: " + e.getMessage());
        } finally {
            session.close();
        }
        return student;
    }
    // UPDATE: Cập nhật thông tin Student
    public void update(Student student) {
        Session session = factory.openSession();
        Transaction tx = null;
        try {
            tx = session.beginTransaction();
            session.update(student); // Tương tự save, nhưng dùng update/merge cho đối tượng đã tồn tại
            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            System.err.println("Error updating student: " + e.getMessage());
        } finally {
            session.close();
        }
    }

    // DELETE: Xóa Student
    public void delete(Student student) {
        Session session = factory.openSession();
        Transaction tx = null;
        try {
            tx = session.beginTransaction();

            // Dùng merge để gắn lại đối tượng vào session hiện tại trước khi xóa
            Object managedStudent = session.merge(student);
            session.remove(managedStudent);

            tx.commit();
        } catch (Exception e) {
            if (tx != null) tx.rollback();
            System.err.println("Error deleting student: " + e.getMessage());
            throw e; // Ném lỗi ra để Controller bắt được và hiện Alert
        } finally {
            session.close();
        }
    }
}
