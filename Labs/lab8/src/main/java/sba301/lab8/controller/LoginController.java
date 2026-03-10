package sba301.lab8.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import sba301.lab8.pojo.Student;
import sba301.lab8.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;


@Controller
public class LoginController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/")
    public String home() {
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String doLogin(@RequestParam String email,
                          @RequestParam String password,
                          Model model) {
        Student student = studentRepository.findByEmail(email);
        if (student != null && student.getPassword().equals(password)) {
            return "redirect:/students";
        }
        model.addAttribute("error", "Invalid email or password!");
        return "login";
    }

    @GetMapping("/logout")
    public String logout() {
        return "redirect:/login";
    }
}
