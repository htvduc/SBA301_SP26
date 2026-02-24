package org.example.controller;

import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Alert;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import org.example.pojos.Student;
import org.example.service.StudentService;

import javafx.scene.control.TableColumn;
import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class StudentController implements Initializable {
    //Ánh xạ các thành phần giao diện và khởi tạo dữ liệu ban đầu tại đây
    //TableView studentTable, TableColumn id, email, firstName, lastName, marks
    @FXML private TableView<Student> studentTable;
    @FXML private TableColumn<Student, Integer> idColumn;
    @FXML private TableColumn<Student, String> emailColumn;
    @FXML private TableColumn<Student, String> firstNameColumn;
    @FXML private TableColumn<Student, String> lastNameColumn;
    @FXML private TableColumn<Student, Double> marksColumn;

    //TextFiled studentId, email, firstName, lastName, marks
    @FXML private javafx.scene.control.TextField txtStudentId;
    @FXML private javafx.scene.control.TextField txtEmail;
    @FXML private javafx.scene.control.TextField txtFirstName;
    @FXML private javafx.scene.control.TextField txtLastName;
    @FXML private javafx.scene.control.TextField txtMarks;
    @FXML private javafx.scene.control.PasswordField txtPassword; //chứ ý đây là PasswordField

    //Tầng Service để xử lý nghiệp vụ
    private final StudentService studentService = new StudentService();

    @Override
    public void initialize(URL url, ResourceBundle resourceBundle) {
        //Thiết lập ánh xạ cột bảng với thuộc tính của Student
        idColumn.setCellValueFactory(new PropertyValueFactory<>("id"));
        emailColumn.setCellValueFactory(new PropertyValueFactory<>("email"));
        firstNameColumn.setCellValueFactory(new PropertyValueFactory<>("firstName"));
        lastNameColumn.setCellValueFactory(new PropertyValueFactory<>("lastName"));
        marksColumn.setCellValueFactory(new PropertyValueFactory<>("marks"));
        //Tải dữ liệu sinh viên vào bảng
        refreshStudentTable();

        //Lắng nghe sự kiện chọn dòng trong bảng để hiển thị chi tiết
        studentTable.getSelectionModel().selectedItemProperty().addListener((obs, oldSelection, newSelection) -> {
            if (newSelection != null) {
                displayStudentDetails(newSelection);
            }
        });



    }
    private void refreshStudentTable() {
        //gọi Service để lấy danh sách sinh viên và cập nhật TableView
        try{
            List<Student> students = studentService.findAll(); //gọi Service để lấy danh sách sinh viên
            ObservableList<Student> studentObservableList = javafx.collections.FXCollections.observableArrayList(students); //Chuyển đổi List sang ObservableList
            studentTable.setItems(studentObservableList); //Cập nhật TableView
        }
        catch(Exception e){
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể tải danh sách sinh viên: " + e.getMessage());
        }
    }
    private void displayStudentDetails(Student student) {
        //Hiển thị chi tiết sinh viên trong các TextField
        // txtStudentId.setText(String.valueOf(student.getId());
        txtEmail.setText(student.getEmail());
        txtPassword.setText(student.getPassword());
        txtFirstName.setText(student.getFirstName());
        txtLastName.setText(student.getLastName());
        txtMarks.setText(String.valueOf(student.getMarks()));
    }
    @FXML
    private void clearForm() {
        //Xóa nội dung trong các TextField
        //txtStudentId.clear();
        txtEmail.clear();
        txtPassword.clear();
        txtFirstName.clear();
        txtLastName.clear();
        txtMarks.clear();
        //Xóa lựa chọn trong TableView
        studentTable.getSelectionModel().clearSelection();
    }


    private void showAlert(Alert.AlertType alertType, String lỗi, String s) {
        Alert alert = new Alert(alertType);
        alert.setTitle(lỗi);
        alert.setHeaderText(null);
        alert.setContentText(s);
        alert.showAndWait();
    }
    //Triển khai Thao tác CRUD (CREATE, UPDATE, DELETE)

    // CREATE
    @FXML
    private void handleAddStudent() {
        try {
            String email = txtEmail.getText();
            String firstName = txtFirstName.getText();
            String lastName = txtLastName.getText();
            Double marks = Double.parseDouble(txtMarks.getText());

            Student newStudent = new Student(email, "", firstName, lastName, marks);
            // Gọi Service để thêm sinh viên mới
            studentService.save(newStudent);
            showAlert(Alert.AlertType.INFORMATION, "Thành công", "Sinh viên đã được thêm thành công.");
            // Cập nhật lại TableView
            refreshStudentTable();
            clearForm(); // Xóa form sau khi thêm
        }
        catch(NumberFormatException nfe) {
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Điểm phải là một số hợp lệ.");
        }
        //Lỗi email trùng hoặc lỗi nghiệp vụ khác sẽ được ném ra từ Service
        catch (Exception e) {
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể thêm sinh viên: " + e.getMessage());
        }
    }
    // UPDATE
    @FXML
    private void handleUpdateStudent() {
        try {
            Student selectedStudent = studentTable.getSelectionModel().getSelectedItem();
            if (selectedStudent == null) {
                showAlert(Alert.AlertType.WARNING, "Cảnh báo", "Vui lòng chọn một sinh viên để cập nhật.");
                return;
            }
            // Cập nhật thông tin sinh viên từ form
            selectedStudent.setEmail(txtEmail.getText());
            selectedStudent.setFirstName(txtFirstName.getText());
            selectedStudent.setPassword(txtPassword.getText());
            selectedStudent.setLastName(txtLastName.getText());
            selectedStudent.setMarks(Double.parseDouble(txtMarks.getText()));
            //Giữ nguyên id
            selectedStudent.setId(selectedStudent.getId());
            // Gọi Service để cập nhật sinh viên
            studentService.update(selectedStudent);
            showAlert(Alert.AlertType.INFORMATION, "Thành công", "Sinh viên đã được cập nhật thành công.");
            // Cập nhật lại TableView
            refreshStudentTable();
            clearForm(); // Xóa form sau khi cập nhật
        } catch (NumberFormatException nfe) {
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Điểm phải là một số hợp lệ.");
        } catch (Exception e) {
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể cập nhật sinh viên: " + e.getMessage());
        }

    }
    // DELETE
    @FXML
    private void handleDeleteStudent() {
        try {
            Student selectedStudent = studentTable.getSelectionModel().getSelectedItem();
            if (selectedStudent == null) {
                showAlert(Alert.AlertType.WARNING, "Cảnh báo", "Vui lòng chọn một sinh viên để xóa.");
                return;
            }
            // Gọi Service để xóa sinh viên
            studentService.delete(selectedStudent);
            showAlert(Alert.AlertType.INFORMATION, "Thành công", "Sinh viên đã được xóa thành công.");
            // Cập nhật lại TableView
            refreshStudentTable();
            clearForm(); // Xóa form sau khi xóa
        } catch (Exception e) {
            showAlert(Alert.AlertType.ERROR, "Lỗi", "Không thể xóa sinh viên: " + e.getMessage());
        }
    }
}

