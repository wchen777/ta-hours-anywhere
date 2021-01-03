import React, { createContext, useReducer, useContext } from 'react'
import jwtDecode from 'jwt-decode'

const AuthStateContext = createContext()
const AuthDispatchContext = createContext()

const token = localStorage.getItem('token')
let user = null

// decode token if it exists in browser already, check expiration
if (token) {
    const decodedToken = jwtDecode(token)
    const expiresAt = new Date(decodedToken.exp * 1000)

    // check expiration, if it is, remove it, otherwise set it to state
    if (new Date() > expiresAt) {
        localStorage.removeItem('token')
    } else {
        user = decodedToken
    }
} else {
    console.log('no token found')
}

const authReducer = (state, action) => {
    switch(action.type){
        case 'LOGIN':
            // store jwt token in local browser
            localStorage.setItem('token', action.payload.token)
            return {
                ...state,
                user: action.payload
            }
        case 'LOGOUT':
            // remove token when loggin out
            localStorage.removeItem('token')
            return {
                ...state,
                user: null
            }
        default:
            throw new Error(`unknown action type: ${action.type}`)
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, { user })

    return (
        <AuthDispatchContext.Provider value={dispatch}>
            <AuthStateContext.Provider value={state}>
                {children}
            </AuthStateContext.Provider>
        </AuthDispatchContext.Provider>
    )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)