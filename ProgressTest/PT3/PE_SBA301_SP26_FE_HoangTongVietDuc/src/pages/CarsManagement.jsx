import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import CarService from '../services/car.service';
import AuthService from '../services/auth.service';
import CarTable from '../components/CarTable';
import ConfirmModal from '../components/ConfirmModal';

const CarsManagement = () => {
    const [cars, setCars] = useState([]);
    const [countries, setCountries] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [carToDelete, setCarToDelete] = useState(null);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();

    const [currentCar, setCurrentCar] = useState({
        carName: '',
        unitsInStock: 5,
        unitPrice: 0,
        countryId: ''
    });

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setCurrentUser(user);
        fetchCars();
        fetchCountries();

        // Open modal if URL is /cars/create and user is Admin
        if (location.pathname === '/cars/create' && isAdmin) {
            setShowModal(true);
        }
    }, [location.pathname]);

    const fetchCars = () => {
        CarService.getAllCars()
            .then(res => setCars(res.data))
            .catch(err => setError("Failed to fetch cars."));
    };

    const fetchCountries = () => {
        CarService.getAllCountries()
            .then(res => {
                console.log("Countries data:", res.data);
                setCountries(res.data);
            })
            .catch(err => console.error("Failed to fetch countries.", err));
    };

    const handleShow = () => {
        setShowModal(true);
        setFormError("");
    };

    const handleClose = () => {
        setShowModal(false);
        setCurrentCar({ carName: '', unitsInStock: 5, unitPrice: 0, countryId: '' });
        setFormError("");
    };

    const validateForm = () => {
        if (!currentCar.carName?.trim()) return "Car Name cannot be empty.";
        if (currentCar.carName.length < 10) return "Car Name must be at least 10 characters.";
        if (!currentCar.unitsInStock && currentCar.unitsInStock !== 0) return "Units In Stock cannot be empty.";
        if (currentCar.unitsInStock < 5 || currentCar.unitsInStock > 20) return "Units In Stock must be between 5 and 20.";
        if (!currentCar.unitPrice && currentCar.unitPrice !== 0) return "Unit Price cannot be empty.";
        if (!currentCar.countryId) return "Please select a country.";
        return null;
    };

    const handleSave = (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        if (currentCar.carId) {
            // Update
            CarService.updateCar(currentCar.carId, currentCar)
                .then(res => {
                    setCars(cars.map(c => c.carId === currentCar.carId ? res.data : c));
                    handleClose();
                })
                .catch(err => setFormError("Failed to update car. " + (err.response?.data?.message || "")));
        } else {
            // Add
            CarService.addCar(currentCar)
                .then(res => {
                    setCars([res.data, ...cars]);
                    handleClose();
                })
                .catch(err => setFormError("Failed to save car. " + (err.response?.data?.message || "")));
        }
    };

    const confirmDelete = (id) => {
        setCarToDelete(id);
        setShowConfirm(true);
    };

    const handleDelete = () => {
        if (carToDelete) {
            CarService.deleteCar(carToDelete)
                .then(() => {
                    setCars(cars.filter(c => c.carId !== carToDelete));
                    setShowConfirm(false);
                    setCarToDelete(null);
                })
                .catch(err => {
                    setError("Failed to delete car.");
                    setShowConfirm(false);
                });
        }
    };

    const isAdmin = currentUser?.role === 'ROLE_1';


    if (!currentUser) {
        return <Container className="mt-5"><Alert variant="warning">Please login to access this page.</Alert></Container>;
    }

    const handleEdit = (car) => {
        setCurrentCar(car);
        setShowModal(true);
        setFormError("");
    };

    return (
        <Container className="mt-4 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Cars Management</h2>
                {isAdmin && (
                    <Button variant="success" onClick={handleShow} size="lg">
                        + Create New Car
                    </Button>
                )}
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

            {location.pathname === '/cars/create' && !isAdmin && (
                <Alert variant="warning" className="shadow-sm border-warning">
                    <h5 className="fw-bold"><i className="bi bi-exclamation-triangle me-2"></i>Access restricted</h5>
                    You do not have permission to create cars. Please contact an administrator.
                </Alert>
            )}

            <CarTable
                cars={cars}
                isAdmin={isAdmin}
                onDelete={confirmDelete}
                onEdit={handleEdit}
            />

            {/* Create/Update Modal */}
            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{currentCar.carId ? "Update Car" : "Add New Car"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {formError && <Alert variant="danger">{formError}</Alert>}
                    <Form onSubmit={handleSave}>
                        <Row>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Car Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter car name ( > 10 characters)"
                                        value={currentCar.carName}
                                        onChange={(e) => setCurrentCar({ ...currentCar, carName: e.target.value })}
                                        isInvalid={formError && currentCar.carName.length <= 10}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Units In Stock</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="5 - 20"
                                        value={currentCar.unitsInStock}
                                        onChange={(e) => setCurrentCar({ ...currentCar, unitsInStock: parseInt(e.target.value) })}
                                        isInvalid={formError && (currentCar.unitsInStock < 5 || currentCar.unitsInStock > 20)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Unit Price ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Price in USD"
                                        value={currentCar.unitPrice}
                                        onChange={(e) => setCurrentCar({ ...currentCar, unitPrice: parseInt(e.target.value) })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold">Country</Form.Label>
                                    <Form.Select
                                        value={currentCar.countryId}
                                        onChange={(e) => setCurrentCar({ ...currentCar, countryId: e.target.value })}
                                        isInvalid={formError && !currentCar.countryId}
                                    >
                                        <option value="">Select a country</option>
                                        {Array.isArray(countries) && countries.length > 0 ? (
                                            countries.map(c => (
                                                <option key={c.countryId} value={c.countryId}>{c.countryName}</option>
                                            ))
                                        ) : (
                                            <option disabled>No countries loaded. Check backend API.</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                            <Button variant="primary" type="submit">{currentCar.carId ? "Update Car" : "Create Car"}</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                show={showConfirm}
                handleClose={() => setShowConfirm(false)}
                handleConfirm={handleDelete}
                title="Delete Car"
                message="Are you sure you want to delete this car? This action cannot be undone."
            />
        </Container>
    );
};

export default CarsManagement;
