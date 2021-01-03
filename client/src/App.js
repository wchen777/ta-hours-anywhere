import './App.scss';
import { Container } from 'react-bootstrap'
import { BrowserRouter, Switch } from 'react-router-dom'
import ApolloProvider from './ApolloProvider'

import RegisterStudent from './pages/RegisterStudent'
import LoginStudent from './pages/LoginStudent'
import RegisterInstructor from './pages/RegisterInstructor'
import LoginInstructor from './pages/LoginInstructor'
import Home from './pages/Home'
import MainStudent from './pages/student-app/MainStudent'
import MainInstructor from './pages/instructor-app/MainInstructor'

import { AuthProvider } from './context/auth'
import { MessageProvider } from './context/messages'
import DynamicRoute from './util/DynamicRoute'

function App() {

  return (
    <ApolloProvider>
      <AuthProvider>
        <MessageProvider>
        <BrowserRouter>
        <Container className="pt-5">
          <Switch>
            <DynamicRoute exact path="/" component={Home} guest/>
            <DynamicRoute path="/register-student" component={RegisterStudent} guest/>
            <DynamicRoute path="/register-instructor" component={RegisterInstructor} guest/>
            <DynamicRoute path="/login-student" component={LoginStudent} guest/>
            <DynamicRoute path="/login-instructor" component={LoginInstructor} guest/>
            <DynamicRoute path="/main-student" component={MainStudent} authenticatedStudent/>
            <DynamicRoute path="/main-instructor" component={MainInstructor} authenticatedInstructor/>
          </Switch>
        </Container>
        </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
