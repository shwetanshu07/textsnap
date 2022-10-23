import React from "react";
import './App.css';
import {Route, BrowserRouter as Router, Routes, Navigate} from 'react-router-dom';
import Navbar from './Navbar';
import Login from './Login';
import Home from "./Home";
import SnippetCreationForm from "./SnippetCreationForm";
import Registration from "./Registration";

class App extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            loggedInStatus : false,
            query : "",
            queryType : "",
            clickedSearch : false
        }
    }

    componentDidMount() {
        // if token is there in the local storage then it means user is logged in
        // else user is not logged in
        if(localStorage.getItem('token')) {
            this.setState({loggedInStatus : true});
        }
    }

    setQueryFields = (queryText, type) => {
        this.setState({
            query : queryText,
            queryType : type,
            clickedSearch : true
        });
    }

    turnOffSearch = () => {
        this.setState({clickedSearch : false});
    }

    render() {
        return (
            <Router>
                <Navbar 
                loggedInStatus={this.state.loggedInStatus} 
                setQueryFields={this.setQueryFields} 
                queryType={this.state.queryType}/>
                <Routes>
                    <Route path='/login' element={ this.state.loggedInStatus ? (
                        <Navigate replace to='/' /> ) : <Login/>} />
                    <Route path='/signup' element={ this.state.loggedInStatus ? ( 
                        <Navigate replace to='/' /> ) : <Registration/>} />
                    <Route path='/' element={<Home 
                                                    loggedInStatus={this.state.loggedInStatus} 
                                                    query={this.state.query}
                                                    queryType={this.state.queryType}
                                                    clickedSearch={this.state.clickedSearch}
                                                    turnOffSearch={this.turnOffSearch}/>} 
                    />
                    <Route path='/create' element={ !this.state.loggedInStatus ? (
                        <Navigate replace to='/' /> ) : <SnippetCreationForm/>} />
                    <Route path='/edit' element={ !this.state.loggedInStatus ? (
                        <Navigate replace to='/' /> ) : <SnippetCreationForm/>} />          
                </Routes>
            </Router>
        )
    }
}

export default App;