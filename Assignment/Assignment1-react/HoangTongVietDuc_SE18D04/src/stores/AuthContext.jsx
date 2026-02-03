import React, { createContext, useReducer } from 'react';
import dbData from '../db.json';

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

        return new Promise((resolve) => {
            setTimeout(() => {
                const isEmail = identifier.includes('@');
                const accounts = dbData?.systemAccounts || [];

                // Tìm account trong db.json
                const account = accounts.find(acc => {
                    if (isEmail) {
                        return acc.accountEmail === identifier && acc.accountPassword === password;
                    } else {
                        return acc.accountName === identifier && acc.accountPassword === password;
                    }
                });

                if (!account) {
                    dispatch({
                        type: 'LOGIN_FAILURE',
                        payload: 'Tài khoản hoặc mật khẩu không đúng.'
                    });
                    resolve({ ok: false, message: 'Tài khoản hoặc mật khẩu không đúng.' });
                    return;
                }

                // Kiểm tra role và cho phép đăng nhập
                const userInfo = {
                    id: account.accountID,
                    accountName: account.accountName,
                    accountEmail: account.accountEmail,
                    accountRole: account.accountRole,
                    role: account.accountRole === 1 ? 'admin' : 'staff' // accountRole 1 = admin, 2 = staff
                };

                dispatch({ type: 'LOGIN_SUCCESS', payload: userInfo });
                resolve({ ok: true, account: userInfo, redirectTo: '/admin' });
                return;
            }, 1000);
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


