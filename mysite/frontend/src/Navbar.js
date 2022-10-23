import React from "react";
import siteLogo from './site_logo.svg';
import toast, { Toaster } from 'react-hot-toast';

class Navbar extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            placeholderText : "Search snippets by tags",
            isAddFilterSelected : false
        }
    }

    // guest user login mechanism
    guestLogin = () => {
        fetch('api/guestlogin/')
        .then((response) => response.json())
        .then((response) => {
            if(response.error) {
                toast.error(response.message, {
                    position: 'top-right',
                });
            }

            // if token is there then store it in the local storage
            if(response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', response.user);
                toast.success('Successfully Logged In.', {
                    position: 'top-right',
                });
                window.location.href = '/';
            }
            // else raise error
            else {
                toast.error('Token not recieved in response', {
                    position: 'top-right',
                });
            }
        })
        .catch((error) => console.log("ERROR FOUND"))
    }

    // log out mechanism
    logout = () => {
        let token = localStorage.getItem('token');
        if(token == null) {
            // weird behaviour! token should have been there
            toast.error('Error logging out!', {
                position : 'top-right'
            })
            return
        }
        fetch('api/logout/', {
            method : 'GET',
            headers : {
                'Authorization' : `Token ${token}`
            }
        })
        .then((response) => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        })
        .catch((error) => console.log(`ERROR - ${error}`))
    }

    // search mechanism
    search = (event) => {
        // set the type of filter; default value is tag 
        let type = 'tag';
        if (document.querySelector('input[name=filterType]:checked') != null) {
            type = document.querySelector('input[name=filterType]:checked').value;
        }

        // set the query term
        let queryText = document.getElementById("query-text").value;
        this.props.setQueryFields(queryText, type);
    }

    // things that happen when you clear the filter
    clearFilters = () => {
        let ele = document.getElementsByName("filterType");
        for(var i=0;i<ele.length;i++)
           ele[i].checked = false;
        this.setState({placeholderText : "Search snippets by tags", isAddFilterSelected : false});
    }

    render() {
        // We will not show the search bar and login button on login and sign up page
        let showSearchBar = true;
        let showLoginBtn = true;
        if (window.location.pathname == '/login') {
            showSearchBar = false;
            showLoginBtn = false;
        }
        if (window.location.pathname == '/signup') {
            showSearchBar = false;
        } 
        
        return (
            <nav className="navbar navbar-expand-lg" style={{backgroundColor : '#232629'}}>
                <div className="container-lg">
                    <a href="/"><img src={siteLogo} alt="site logo" height="30" /></a>

                    {showSearchBar && 
                    <form className="d-flex" role="search" style={{width : "50%"}}>
                        <input id="query-text" className="form-control me-2" type="search" placeholder={this.state.placeholderText} />
                        
                        <div className="dropdown input-group-text border-0 filter-btn me-2">
                            <a className="dropdown-toggle d-flex align-items-center" id="advanced-filter-dropdown" role="button" data-bs-toggle="dropdown">
                                <span className="text-black"><i className="fa fa-filter"></i></span>
                            </a>
                        
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li className="mx-2"><span>Advanced Filter</span></li>
                                <li><hr className="dropdown-divider" /></li>
                                <li className="form-check mx-2">
                                    <input className="form-check-input" type="radio" name="filterType" value="author" id="authorFilter" 
                                    onChange={() => this.setState({
                                        placeholderText : "Search snippets by authors", 
                                        isAddFilterSelected : true
                                    })}/>
                                    <label htmlFor="authorFilter">Filter by Authors</label>
                                </li>
                                <li className="form-check mx-2">
                                    <input className="form-check-input" type="radio" name="filterType" value="book" id="bookFilter" 
                                    onChange={() => this.setState({
                                        placeholderText : "Search snippets by books", 
                                        isAddFilterSelected : true
                                    })} />
                                    <label htmlFor="bookFilter">Filter by Book</label>
                                </li>
                                <li className="form-check mx-2">
                                    <input className="form-check-input" type="radio" name="filterType" value="snippet" id="snippetTextFilter" 
                                    onChange={() => this.setState({
                                        placeholderText : "Search by snippet text", 
                                        isAddFilterSelected : true
                                    })} />
                                    <label htmlFor="snippetTextFilter">Filter by Snippet Text</label>
                                </li>
                                {
                                    this.state.isAddFilterSelected && <li className="form-check mx-2 d-flex justify-content-end">
                                        <span style={{color :"blue"}} onClick={this.clearFilters}><small>Clear Filters</small></span>
                                    </li>
                                }
                            </ul>
                        </div>
                        <span className="input-group-text text-black border-0 custom-btn" id="search-addon" 
                        onClick={this.search}>
                            <i className="fa fa-search"></i>
                        </span>
                    </form>
                    }
                    
                    {
                        // If user is not logged in show buttons for login and guest login
                        !this.props.loggedInStatus && <div className="login-btns-wrapper">
                            <a className="btn btn-secondary me-2" role="button" onClick={this.guestLogin}>Guest Login</a>
                            {showLoginBtn && <a className="btn btn-primary" href="/login" role="button">Login</a>}
                        </div>
                    }

                    {
                        // If user is logged in then show user menu
                        this.props.loggedInStatus && <div className="d-flex">
                            <div className="dropdown d-flex">
                                <a className="dropdown-toggle d-flex align-items-center" role="button" 
                                data-bs-toggle="dropdown" href="#/" id="profile">
                                    <span className="d-flex flex-column me-2">
                                        <span className="d-flex align-items-center">
                                            <span className="me-1" style={{fontSize : '1rem'}}>✋</span> 
                                            <strong>{localStorage.getItem('user')}</strong>
                                        </span>
                                    </span>
                                </a>
                                
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><a className="dropdown-item" onClick={this.logout}>Logout</a></li>
                                </ul>
                            </div>
                        </div>
                    }

                </div>
                <Toaster />
            </nav>
        )
    }
}

export default Navbar;