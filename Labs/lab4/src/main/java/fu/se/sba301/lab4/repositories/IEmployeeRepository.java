package fu.se.sba301.lab4.repositories;


import fu.se.sba301.lab4.pojos.Employee;
import org.springframework.data.repository.PagingAndSortingRepository;
import java.util.List;

public interface IEmployeeRepository extends PagingAndSortingRepository<Employee, String> {
    Employee getEmployeeById(String empId);
    Employee delete(String id);
    Employee create(Employee user);
    List<Employee> getAllEmployees();
}