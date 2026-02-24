package org.example.pojos;


import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "BOOKS")
public class Book implements Serializable {

    @Id // Khóa chính (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động tăng giá trị ID
    private int id; // Corresponds to BOOKS(id)

    @Column(name = "title", length = 50)
    private String title; // Tiêu đề sách

    @Column(name = "author")
    private String author; // Tác giả

    @Column(name = "isbn", unique = true) // ISBN là duy nhất
    private String isbn; // Mã ISBN của sách


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = true) // Khóa ngoại trỏ đến Student
    private Student student; // Student đang mượn cuốn sách này

    // Constructor mặc định (cần thiết cho Hibernate)
    public Book() {
    }

    // Constructor đầy đủ cho các trường dữ liệu
    public Book(String title, String author, String isbn, Student student) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.student = student;
    }

    // Constructor tiện lợi khi chưa có Student
    public Book(String title, String author, String isbn) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
    }

    // --- Getters và Setters ---

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", isbn='" + isbn + '\'' +
                // Không in ra student để tránh lỗi StackOverflow khi Student in ra Book và ngược lại
                '}';
    }
}

