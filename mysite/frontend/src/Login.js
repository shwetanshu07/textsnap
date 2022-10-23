import React from "react";
import toast, { Toaster } from 'react-hot-toast';

class Login extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            username : "",
            password : ""
        };
    }

    authenticateUser = () => {
        fetch('auth/', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/JSON',
            },
            body : JSON.stringify({
                username : this.state.username,
                password : this.state.password
            })
        })
        .then((response) => response.json())
        .then((response) => {
            // if token is there then store it in the local storage
            if(response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', this.state.username);
                toast.success('Successfully Logged In.', {
                    position: 'top-right',
                });
                window.location.href = '/';
            }
            // else raise error
            else {
                toast.error('Invalid Credentials.', {
                    position: 'top-right',
                });
            }
        })
        .catch((error) => console.log("ERROR FOUND"))
    }

    render() {
        return (
            <div className="container login-container mt-5">
                <div className="card">
                    <div className="card-header">
                        <h4 className="my-2"><strong>Login</strong></h4>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="mb-3">
                                <label htmlFor="username-input" className="form-label">Enter Username</label>
                                <input type="text" className="form-control" id="username-input" onChange={(e) => {
                                    this.setState({username : e.target.value})
                                }}></input>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password-input" className="form-label">Enter Password</label>
                                <input type="password" className="form-control" id="password-input" onChange={(e) => {
                                    this.setState({password : e.target.value})
                                }}></input>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer d-flex justify-content-end">
                        <button type="button" className="btn btn-primary" onClick={this.authenticateUser}>Login</button>
                    </div>
                </div>
                <Toaster />
            </div>
        )
    }
}

export default Login;