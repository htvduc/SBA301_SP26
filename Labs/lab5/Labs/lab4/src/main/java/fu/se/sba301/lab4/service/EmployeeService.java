package fu.se.sba301.lab4.service;


import fu.se.sba301.lab4.repositories.IEmployeeRepository;
import fu.se.sba301.lab4.pojos.Employee;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService implements IEmployeeService {
    @Autowired
    private IEmployeeRepository employeeRepository; // [cite: 48]

    public Employee getEmployeeById(String empId) {
        return employeeRepository.getEmployeeById(empId);
    }
    public Employee delete(String id) {
        return employeeRepository.delete(id);
    }
    public Employee create(Employee user) {
        return employeeRepository.create(user);
    }
    public Page<Employee> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }
}