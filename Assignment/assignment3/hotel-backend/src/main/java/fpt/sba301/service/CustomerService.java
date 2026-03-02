package fpt.sba301.service;

import fpt.sba301.dto.RegisterRequest;
import fpt.sba301.entity.Customer;

import java.util.List;

public interface CustomerService {

    Customer create(Customer customer);

    List<Customer> getAll();

    Customer getById(Integer id);

    Customer update(Integer id, Customer customer);

    void delete(Integer id);

    Customer login(String email, String password);

    Customer register(RegisterRequest request);

    void changePassword(Integer customerId, String oldPassword, String newPassword);
}
