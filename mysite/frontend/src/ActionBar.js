import React from "react";
import { Link } from "react-router-dom";

class ActionBar extends React.Component
{
    switchTabs = (event) => {
        let itemToBeDeActivate = '';
        let listType = null;
        // If All Snippets is clicked then set it to active and remove active 
        // from My snippets and vice versa.
        if(event.target.id == 'all-snippets-tab') {
            itemToBeDeActivate = 'my-snippets-tab';
            listType = 0;
        } else {
            itemToBeDeActivate = 'all-snippets-tab';
            listType = 1;
        }

        let element1 = document.getElementById(event.target.id);
        element1.classList.add('active');
        let element2 = document.getElementById(itemToBeDeActivate);
        element2.classList.remove('active');

        // Call to its parent method to fetch the snippet list 
        // and the type of snippet list - my snippet or all snippets
        this.props.fetchSnippets(listType);
    }

    render() {
        return (
            <div className="container-md mt-4">
                <div className="d-flex justify-content-between align-items-center">
                    { // Show action tabs when user is logged in
                    this.props.loggedInStatus &&
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className="nav-link active" id="all-snippets-tab" onClick={(e) => this.switchTabs(e)}>All Snippets</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" id="my-snippets-tab" onClick={(e) => this.switchTabs(e)}>My Snippets</a>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/create">Add Snippet</Link>
                        </li>
                    </ul>
                    }
            
                    { // Only show sorting options when data is there
                    this.props.dataCount > 0 && 
                    <div className="d-flex">
                        <span className="me-2"><i className="fa fa-sort"></i> Sort By</span>
                        <div className="d-flex sort-btn-container">
                            <div className="form-check me-2">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" value="1" defaultChecked
                                onChange={(e) => {this.props.changeSnippetListOrder(e.target.value)}}/>
                                <label className="form-check-label" htmlFor="flexRadioDefault1">Latest</label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" value="2"
                                onChange={(e) => {this.props.changeSnippetListOrder(e.target.value)}}/>
                                <label className="form-check-label" htmlFor="flexRadioDefault2">Most Liked</label>
                            </div>
                        </div>
                    </div>
                    }

                </div>
            </div>
        )
    }
}

export default ActionBar;