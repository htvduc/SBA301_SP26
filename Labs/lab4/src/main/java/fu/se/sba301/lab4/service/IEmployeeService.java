package fu.se.sba301.lab4.service;

import fu.se.sba301.lab4.pojos.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEmployeeService {
    Employee getEmployeeById(String empId);
    Employee delete(String id);
    Employee create(Employee user);
    Page<Employee> getAllEmployees(Pageable pageable);
}
