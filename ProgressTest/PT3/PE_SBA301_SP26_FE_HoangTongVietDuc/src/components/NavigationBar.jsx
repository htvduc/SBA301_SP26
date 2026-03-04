import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const NavigationBar = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(undefined);
    const navigate = useNavigate();

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);

    const handleClose = () => {
        setShowLogin(false);
        setError("");
        setUsername("");
        setPassword("");
    };
    const handleShow = () => setShowLogin(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const user = await AuthService.login(username, password);
            setCurrentUser(user);
            handleClose();
            window.location.reload();
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    const logOut = () => {
        AuthService.logout();
        setCurrentUser(undefined);
        navigate("/");
        window.location.reload();
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">DE180839 - Việt Đức - PE Sping 26</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Home</Nav.Link>
                            <NavDropdown title="Car Management" id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/cars">List all cars</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/cars/create">Create a new car</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        <Nav>
                            {currentUser ? (
                                <>
                                    <Navbar.Text className="me-3">
                                        Signed in as: <span className="text-white fw-bold">{currentUser.username}</span>
                                    </Navbar.Text>
                                    <Button variant="outline-danger" size="sm" onClick={logOut}>Logout</Button>
                                </>
                            ) : (
                                <Button variant="outline-light" onClick={handleShow}>Login</Button>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Modal show={showLogin} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Login to Cars Management System</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default NavigationBar;
