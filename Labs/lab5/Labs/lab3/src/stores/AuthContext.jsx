import React, { createContext, useReducer } from 'react';

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

    const mockAccounts = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin',
            status: 'active'
        },
        {
            id: 2,
            username: 'user1',
            email: 'user1@example.com',
            password: '123456',
            role: 'user',
            status: 'active'
        },
        {
            id: 3,
            username: 'user2',
            email: 'user2@example.com',
            password: '123456',
            role: 'user',
            status: 'locked'
        }
    ];

    function login(identifier, password) {
        dispatch({ type: 'LOGIN_REQUEST' });

        return new Promise((resolve) => {
            setTimeout(() => {
                const isEmail = identifier.includes('@');

                const account = mockAccounts.find(acc => {
                    if (isEmail) {
                        return acc.email === identifier && acc.password === password;
                    } else {
                        return acc.username === identifier && acc.password === password;
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

                if (account.status === 'locked') {
                    dispatch({
                        type: 'LOGIN_FAILURE',
                        payload: 'Tài khoản đã bị khóa'
                    });
                    resolve({ ok: false, message: 'Tài khoản đã bị khóa' });
                    return;
                }

                if (account.role !== 'admin') {
                    dispatch({
                        type: 'LOGIN_FAILURE',
                        payload: 'Từ chối truy cập. Chỉ người dùng admin mới có thể đăng nhập.'
                    });
                    resolve({ ok: false, message: 'Từ chối truy cập. Chỉ người dùng admin mới có thể đăng nhập.' });
                    return;
                }

                const userInfo = {
                    id: account.id,
                    username: account.username,
                    email: account.email,
                    role: account.role,
                    status: account.status
                };

                dispatch({ type: 'LOGIN_SUCCESS', payload: userInfo });
                resolve({ ok: true, account: userInfo });
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


