import React, { useState } from "react";
import { Container, Form, Button, Card, Row, Col, InputGroup, ListGroup } from "react-bootstrap";
import ConfirmModal from "./ConfirmModal";

function Contact() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    email: "",
    consent: false,
  });

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    setForm((f) => ({ ...f, [name]: fieldValue }));

    if (errors[name]) {
      const fieldError = validateField(name, fieldValue);
      setErrors((prev) => {
        const next = { ...prev };
        if (fieldError) next[name] = fieldError;
        else delete next[name];
        return next;
      });
    }
  };

  const validateField = (name, value) => {
    const nameRegex = /^[\p{L}\s'-]+$/u;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name === "firstname") {
      if (!String(value).trim()) return "First name is required";
      if (!nameRegex.test(value)) return "First name must contain only letters";
      return null;
    }
    if (name === "lastname") {
      if (!String(value).trim()) return "Last name is required";
      if (!nameRegex.test(value)) return "Last name must contain only letters";
      return null;
    }
    if (name === "phone") {
      if (!String(value).trim()) return "Phone is required";
      if (!phoneRegex.test(value)) return "Phone must be 10 digits";
      return null;
    }
    if (name === "email") {
      if (!String(value).trim()) return "Email is required";
      if (!emailRegex.test(value)) return "Email is invalid";
      return null;
    }
    if (name === "consent") {
      if (!value) return "You must agree to the terms";
      return null;
    }
    return null;
  };

  const validate = () => {
    const errs = {};
    const nameRegex = /^[\p{L}\s'-]+$/u;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstname.trim()) errs.firstname = "First name is required";
    else if (!nameRegex.test(form.firstname)) errs.firstname = "First name must contain only letters";

    if (!form.lastname.trim()) errs.lastname = "Last name is required";
    else if (!nameRegex.test(form.lastname)) errs.lastname = "Last name must contain only letters";

    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!phoneRegex.test(form.phone)) errs.phone = "Phone must be 10 digits";

    if (!form.email.trim()) errs.email = "Email is required";
    else if (!emailRegex.test(form.email)) errs.email = "Email is invalid";

    if (!form.consent) errs.consent = "You must agree to the terms";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) setShowModal(true);
  };

  const handleClose = () => setShowModal(false);
  const handleConfirm = () => {
    // On confirm: just close modal. Adjust if you want to reset or persist data.
    setShowModal(false);
  };

  const contactBody = (
    <ListGroup variant="flush">
      <ListGroup.Item>
        <strong>First name:</strong>
        <div className="text-muted">{form.firstname}</div>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Last name:</strong>
        <div className="text-muted">{form.lastname}</div>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Phone:</strong>
        <div className="text-muted">{form.phone}</div>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Email:</strong>
        <div className="text-muted">{form.email}</div>
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Consent:</strong>
        <div className="text-muted">{form.consent ? "Yes" : "No"}</div>
      </ListGroup.Item>
    </ListGroup>
  );

  return (
    <Container className="mt-4">
      <Card className="mx-auto" style={{ maxWidth: 820 }}>
        <Card.Body>
          <Card.Title className="mb-3">Contact</Card.Title>

          <Form noValidate onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="firstname">
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    isInvalid={!!errors.firstname}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstname}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="lastname">
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    size="lg"
                    type="text"
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    isInvalid={!!errors.lastname}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastname}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <InputGroup>
                    <Form.Control
                      size="lg"
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      isInvalid={!!errors.phone}
                      placeholder="0123456789"
                    />
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    size="lg"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="you@example.com"
                  />
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Group controlId="consent">
                  <Form.Check
                    type="checkbox"
                    name="consent"
                    label="I confirm the information above is correct"
                    checked={form.consent}
                    onChange={handleChange}
                  />
                  {errors.consent && <div className="text-danger mt-1">{errors.consent}</div>}
                </Form.Group>
              </Col>

              <Col xs={12} className="d-flex justify-content-end">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => {
                    setForm({ firstname: "", lastname: "", phone: "", email: "", consent: false });
                    setErrors({});
                  }}
                >
                  Reset
                </Button>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <ConfirmModal
        show={showModal}
        handleClose={handleClose}
        title="Confirm Contact"
        body={contactBody}
        onConfirm={handleConfirm}
      />
    </Container>
  );
}

export default Contact;