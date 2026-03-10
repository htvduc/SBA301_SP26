package sba301.lab8.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import sba301.lab8.pojo.Student;
import sba301.lab8.service.StudentService;

@Controller
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public String listStudents(Model model) {
        model.addAttribute("students", studentService.getAllStudents());
        return "student-list";
    }

    @PostMapping("/save")
    public String saveStudent(@ModelAttribute Student student,
                              RedirectAttributes ra) {
        if (studentService.existsByEmail(student.getEmail())) {
            ra.addFlashAttribute("errorMsg", "Email '" + student.getEmail() + "' already exists!");
            return "redirect:/students";
        }
        studentService.saveStudent(student);
        ra.addFlashAttribute("successMsg", "Student added successfully!");
        return "redirect:/students";
    }

    @PostMapping("/update")
    public String updateStudent(@ModelAttribute Student student,
                                RedirectAttributes ra) {
        studentService.saveStudent(student);
        ra.addFlashAttribute("successMsg", "Student updated successfully!");
        return "redirect:/students";
    }

    @GetMapping("/delete/{id}")
    public String deleteStudent(@PathVariable String id,
                                RedirectAttributes ra) {
        studentService.deleteStudent(id);
        ra.addFlashAttribute("successMsg", "Student deleted successfully!");
        return "redirect:/students";
    }
}
