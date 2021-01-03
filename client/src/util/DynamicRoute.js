import React from 'react'
import { Route, Redirect } from 'react-router-dom' 

import { useAuthState } from '../context/auth'

// Route guards

export default function DynamicRoute(props){
    const { user } = useAuthState()
    
    if (props.authenticatedStudent && (!user || user.isInstructor)) {
        // trying to access student logged in page when no student logged in
        return <Redirect to="/login-student"/>
    } else if (props.authenticatedInstructor && (!user || !user.isInstructor)) {
        // trying to access instructor logged in page when no instructorlogged in
        return <Redirect to="/login-instructor"/>
    } else if (props.guest && (user && !user.isInstructor)) {
        // accessing guest pages with authenticated student
        return <Redirect to="/main-student"/>
    } else if (props.guest && (user && user.isInstructor)) {
        // accessing guest pages with authenticated instructor
        return <Redirect to="/main-instructor"/>
    } else {
        return <Route component={props.component} {...props} />
    }
}