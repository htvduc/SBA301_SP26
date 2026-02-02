import { useReducer, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../stores/AuthContext";

const initialFormState = {
  identifier: "",
  password: "",
  errors: {},
};

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "CLEAR_ERROR": {
      const { [action.field]: _, ...restErrors } = state.errors;
      return {
        ...state,
        errors: restErrors,
      };
    }
    case "SET_ERRORS":
      return {
        ...state,
        errors: action.errors,
      };
    case "RESET_FORM":
      return initialFormState;
    default:
      return state;
  }
}

export default function useLogin(onLogin) {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  const authContext = useContext(AuthContext);
  const { login, isLoading, error, clearError } = authContext;

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = (v) => v.includes("@");

  const handleChange = (e) => {
    const { name, value } = e.target;

    dispatch({ type: "SET_FIELD", field: name, value });
    clearError();

    if (name === "identifier") {
      if (!value.trim()) {
        dispatch({
          type: "SET_ERROR",
          field: name,
          message: "Username hoặc Email là bắt buộc.",
        });
      } else if (isEmail(value) && !emailRegex.test(value)) {
        dispatch({
          type: "SET_ERROR",
          field: name,
          message: "Email không hợp lệ.",
        });
      } else {
        dispatch({ type: "CLEAR_ERROR", field: name });
      }
    }

    if (name === "password") {
      if (!value.trim()) {
        dispatch({
          type: "SET_ERROR",
          field: name,
          message: "Mật khẩu là bắt buộc.",
        });
      } else {
        dispatch({ type: "CLEAR_ERROR", field: name });
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formState.identifier.trim()) {
      errors.identifier = "Username hoặc Email là bắt buộc.";
    } else if (
      isEmail(formState.identifier) &&
      !emailRegex.test(formState.identifier)
    ) {
      errors.identifier = "Email không hợp lệ.";
    }

    if (!formState.password.trim()) {
      errors.password = "Mật khẩu là bắt buộc.";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const validationErrors = validateForm();
    dispatch({ type: "SET_ERRORS", errors: validationErrors });

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const result = await login(
        formState.identifier.trim(),
        formState.password
      );

      if (result.ok) {
        localStorage.setItem("auth", "true");
        localStorage.setItem("user", JSON.stringify(result.account));

        if (onLogin) onLogin(true);

        dispatch({ type: "RESET_FORM" });

        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleReset = () => {
    dispatch({ type: "RESET_FORM" });
    clearError();
  };

  return {
    formState,
    isLoading,
    error,
    handleChange,
    handleSubmit,
    handleReset,
  };
}
