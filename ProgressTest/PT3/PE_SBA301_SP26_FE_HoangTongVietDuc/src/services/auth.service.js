import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const login = (username, password) => {
    return axios
        .post(API_URL + "signin", {
            username,
            password,
        })
        .then((response) => {
            if (response.data.accessToken) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

const authHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.accessToken) {
        return { Authorization: 'Bearer ' + user.accessToken };
    } else {
        return {};
    }
};

const AuthService = {
    login,
    logout,
    getCurrentUser,
    authHeader,
};

export default AuthService;
