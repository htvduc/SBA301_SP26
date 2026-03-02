package fpt.sba301.service;

import fpt.sba301.dto.RegisterRequest;
import fpt.sba301.entity.Customer;
import fpt.sba301.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Customer create(Customer customer) {
        return repository.save(customer);
    }

    @Override
    public List<Customer> getAll() {
        return repository.findAll();
    }

    @Override
    public Customer getById(Integer id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @Override
    public Customer update(Integer id, Customer customer) {
        Customer existing = getById(id);

        existing.setCustomerFullName(customer.getCustomerFullName());
        existing.setTelephone(customer.getTelephone());
        existing.setEmail(customer.getEmail());
        existing.setCustomerBirthday(customer.getCustomerBirthday());

        return repository.save(existing);
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public Customer login(String email, String password) {

        Customer customer = repository.findByEmail(email).orElse(null);

        if (customer != null &&
                passwordEncoder.matches(password, customer.getPassword())) {
            return customer;
        }

        return null;
    }

    @Override
    public Customer register(RegisterRequest request) {

        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Customer customer = Customer.builder()
                .customerFullName(request.getFullName())
                .email(request.getEmail())
                .telephone(request.getTelephone())
                .password(passwordEncoder.encode(request.getPassword()))
                .customerStatus(1)
                .build();

        return repository.save(customer);
    }

    @Override
    public void changePassword(Integer customerId, String oldPassword, String newPassword) {
        Customer customer = getById(customerId);
        if (!passwordEncoder.matches(oldPassword, customer.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        customer.setPassword(passwordEncoder.encode(newPassword));
        repository.save(customer);
    }
}
