import axios from "axios";
import AuthService from "./auth.service";

const API_URL = "http://localhost:8080/api/";

const getAllCars = () => {
    return axios.get(API_URL + "cars");
};

const addCar = (car) => {
    return axios.post(API_URL + "cars", car, { headers: AuthService.authHeader() });
};

const deleteCar = (id) => {
    return axios.delete(API_URL + "cars/" + id, { headers: AuthService.authHeader() });
};

const getCarById = (id) => {
    return axios.get(API_URL + "cars/" + id);
};

const updateCar = (id, car) => {
    return axios.put(API_URL + "cars/" + id, car, { headers: AuthService.authHeader() });
};

const getAllCountries = () => {
    return axios.get(API_URL + "cars/countries");
};

const CarService = {
    getAllCars,
    getCarById,
    addCar,
    updateCar,
    deleteCar,
    getAllCountries,
};

export default CarService;
