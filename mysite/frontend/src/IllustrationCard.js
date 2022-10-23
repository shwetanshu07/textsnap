import React from "react";
import { Link } from "react-router-dom";
import info_illustration from './info_illustration.svg';

class IllustrationCard extends React.Component
{
    render() {
        return (
            <div className="card illustration-card">
                <div className="container-md">
                <div className="card-body d-flex illustration-card-body">
                    <img src={info_illustration} id="illustration-img" alt="illustration" height="120" />
                    <div className="illustration-text-wrapper">
                        <p className="main-illustration-text">Textsnap helps you organise your favourite text snippets, quotes and sayings in one single place. 
                        Associate your snippets with custom tags and browse through what others find interesting.</p>
                        <Link className="btn btn-light" to='/signup'><span><strong>Sign up here</strong></span></Link>
                    </div>
                </div>
                </div>
            </div>

        );
    }
}

export default IllustrationCard;