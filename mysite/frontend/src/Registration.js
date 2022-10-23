import React from "react";
import toast, { Toaster } from "react-hot-toast";

class Registration extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            username : "",
            password : ""
        };
    }

    registerUser = () => {
        fetch('api/registeruser/', {
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
            if(response.error) {
                toast.error(response.message, {
                    position: 'top-right',
                });
                return;
            }

            // No error - check token is there or not
            if(!response.hasOwnProperty('token')) {
                toast.error('Token not recieved.', {
                    position: 'top-right',
                });
                return;
            }

            // Log in user
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', this.state.username);
            toast.success('You have been successfully registered. You will be redirected in a moment.', {
                position: 'top-right',
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        })
        .catch((error) => console.log("ERROR FOUND"))
    }

    render() {
        return (
            <div className="container login-container mt-5">
                <div className="card">
                    <div className="card-header">
                        <h4 className="my-2"><strong>Sign Up</strong></h4>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="mb-3">
                                <label htmlFor="username-input" className="form-label">Enter Username</label>
                                <input type="text" className="form-control" id="username-input" onChange={(e) => {
                                    this.setState({username : e.target.value})
                                }}></input>
                                <div id="usernameHelp" className="form-text">Username should be minimum 4 characters long.</div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password-input" className="form-label">Enter Password</label>
                                <input type="password" className="form-control" id="password-input" onChange={(e) => {
                                    this.setState({password : e.target.value})
                                }}></input>
                                <div id="passwordHelp" className="form-text">Password should be minimum 6 characters long.</div>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer d-flex justify-content-end">
                        <button type="button" className="btn btn-primary" onClick={this.registerUser}>Sign Up</button>
                    </div>
                </div>
                <Toaster />
            </div>
        )
    }
}

export default Registration;