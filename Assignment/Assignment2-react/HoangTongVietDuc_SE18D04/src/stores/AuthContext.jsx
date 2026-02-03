import React, { createContext, useReducer } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const initialState = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return initialState;

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};


// 2. Tạo Provider
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    function login(identifier, password) {
        dispatch({ type: 'LOGIN_REQUEST' });

        return authAPI.login({ identifier, password })
            .then(response => {
                // Backend trả về: { accountID, accountName, accountEmail, accountRole }
                const userInfo = {
                    id: response.accountID,
                    accountName: response.accountName,
                    accountEmail: response.accountEmail,
                    accountRole: response.accountRole,
                    role: response.accountRole === 1 ? 'admin' : 'staff'
                };

                dispatch({ type: 'LOGIN_SUCCESS', payload: userInfo });
                return { ok: true, account: userInfo, redirectTo: '/admin' };
            })
            .catch(error => {
                const errorMessage = error.message || 'Tài khoản hoặc mật khẩu không đúng.';
                dispatch({
                    type: 'LOGIN_FAILURE',
                    payload: errorMessage
                });
                return { ok: false, message: errorMessage };
            });
    }

    function logout() {
        dispatch({ type: 'LOGOUT' });
    }

    function clearError() {
        dispatch({ type: 'CLEAR_ERROR' });
    }

    const contextValue = {
        user: state.user,
        isLoading: state.isLoading,  
        error: state.error,
        isAuthenticated: state.isAuthenticated,
        login,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={contextValue}>  
            {children}
        </AuthContext.Provider>
    );

}


export default AuthContext;


