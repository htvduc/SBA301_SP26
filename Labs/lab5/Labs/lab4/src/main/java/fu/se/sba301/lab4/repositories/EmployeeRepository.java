package fu.se.sba301.lab4.repositories;

import fu.se.sba301.lab4.pojos.Employee;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class EmployeeRepository implements IEmployeeRepository {
    private List<Employee> employees = createList();

    private List<Employee> createList() {
        List<Employee> temp = new ArrayList<>();
        temp.add(new Employee("EMP01", "Steven Paris", "Technical Manager", 3000));
        temp.add(new Employee("EMP02", "John Lemon", "Developer", 1000));
        temp.add(new Employee("EMP03", "Steven Paris", "Tester", 3000));
        return temp;
    }

    @Override
    public List<Employee> getAllEmployees() {
        return employees;
    }

    @Override
    public Employee getEmployeeById(String empId) {
        return employees.stream().filter(e -> e.getEmpId().equals(empId)).findFirst().orElse(null);

    }

    @Override
    public Employee delete(String id) {
        Employee found = getEmployeeById(id);
        if (found != null) employees.remove(found);
        return found;
    }

    @Override
    public Employee create(Employee user) {
        employees.add(user);
        return user;
    }

    @Override
    public Page<Employee> findAll(Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), employees.size());
        return new PageImpl<>(employees.subList(start, end), pageable, employees.size());
    }

    @Override
    public Iterable<Employee> findAll(Sort sort) { return employees; }
}