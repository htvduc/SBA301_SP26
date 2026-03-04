import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import CarService from "../services/car.service";

const CarTable = ({ isAdmin, onDelete, onEdit, cars: propsCars }) => {
    const [internalCars, setInternalCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const cars = propsCars || internalCars;

    useEffect(() => {
        if (!propsCars) {
            fetchCars();
        }
    }, [propsCars]);

    const fetchCars = () => {
        setLoading(true);
        CarService.getAllCars()
            .then((response) => {
                setInternalCars(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError("Could not fetch cars data.");
                setLoading(false);
            });
    };

    if (loading) return <div className="text-center my-4"><Spinner animation="border" /></div>;
    if (error && !propsCars) return <Alert variant="danger">{error}</Alert>;

    return (
        <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-dark text-center">
                <tr>
                    <th>ID</th>
                    <th>Car Name</th>
                    <th>In Stock</th>
                    <th>Price</th>
                    <th>Country</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    {isAdmin && <th>Actions</th>}
                </tr>
            </thead>
            <tbody className="text-center align-middle">
                {cars.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="text-muted italic">No cars available.</td>
                    </tr>
                ) : (
                    cars.map((car) => (
                        <tr key={car.carId}>
                            <td>{car.carId}</td>
                            <td className="fw-bold">{car.carName}</td>
                            <td>{car.unitsInStock}</td>
                            <td className="text-success fw-bold">${car.unitPrice.toLocaleString()}</td>
                            <td>{car.countryName}</td>
                            <td>{new Date(car.createdAt).toLocaleDateString()}</td>
                            <td>{new Date(car.updatedAt).toLocaleDateString()}</td>
                            {isAdmin && (
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={() => onEdit(car)}>
                                            Update
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => onDelete(car.carId)}>
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))
                )}
            </tbody>
        </Table>
    );
};

export default CarTable;
