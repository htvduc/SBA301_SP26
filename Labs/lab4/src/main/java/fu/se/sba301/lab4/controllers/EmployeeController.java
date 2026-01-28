package fu.se.sba301.lab4.controllers;


import fu.se.sba301.lab4.pojos.Employee;
import fu.se.sba301.lab4.service.IEmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
public class EmployeeController {
    @Autowired
    private IEmployeeService employeeService;

    @GetMapping("/employees")
    public Page<Employee> firstPage(Pageable pageable) {
        return employeeService.getAllEmployees(pageable);
    }
    @GetMapping("/employees/{empId}")
    public Employee getEmployeeById(@PathVariable String empId) {
        return employeeService.getEmployeeById(empId);
    }

    @PostMapping("/employees")
    public Employee create(@RequestBody Employee employee) {
        return employeeService.create(employee);
    }

    @DeleteMapping("/employees/{id}")
    public Employee delete(@PathVariable String id) {
        return employeeService.delete(id);
    }
}