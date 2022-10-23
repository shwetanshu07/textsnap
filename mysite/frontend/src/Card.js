import React from "react";
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";

class Card extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            like_status : this.props.snippetData.like_status,
            like_count : this.props.snippetData.likes
        }
    }

    // mechanism for liking / removing a like from a snippet
    changeLikeStatus = () => {
        // If token is not there then user is not allowed to like
        let token = localStorage.getItem('token');
        if(!token) {
            toast.error('Please login first.', {
                position: 'top-right',
            });
            return;
        }

        // 1 - action of liking; 0 - action of removing like
        // so is it has already been liked then we are removing 
        // otherwise we are liking the snippet
        let action = this.state.like_status ? 0 : 1;
        
        fetch('api/modifysnippetlikes/', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/JSON',
                'Authorization' : `Token ${token}`
            },
            body : JSON.stringify({
                action : action,
                snippet_id : this.props.snippetData.id
            })
        })
        .then((response) => {
            if(!response.ok) {
                toast.error(response.statusText, {
                    position: 'top-right',
                });
                return;
            }
            return response.json();
        })
        .then((data) => {
            if(data.error) {
                toast.error(data.msg, {
                    position: 'top-right',
                });
                return;
            }

            // no issues opertaion performed successfully
            if(action == 1) {
                this.setState((state, props) => ({
                    like_status : true,
                    like_count : state.like_count + 1
                }));
            }
            else {
                this.setState((state, props) => ({
                    like_status : false,
                    like_count : state.like_count - 1
                }));
            }            
        })
        .catch((error) => console.log(`ERROR => ${error}`))
    }

    render() {
        // logic for displaying the source
        let source = "Unknown";
        if (this.props.snippetData.author) {
            source = this.props.snippetData.author;
        }
        if (this.props.snippetData.book){
            source = this.props.snippetData.book;
        }
        if(this.props.snippetData.author && this.props.snippetData.book) {
            source = `${this.props.snippetData.author}, ${this.props.snippetData.book}`;
        }

        let postDate = new Date(this.props.snippetData.created * 1000);
        let formattedPostDate = `${postDate.getDate()}.${postDate.getMonth()+1}.${postDate.getFullYear()}`;

        return (
            <div className="card mb-3">
                <div className="card-body">
                    <blockquote className="blockquote mb-0">
                        <p>{this.props.snippetData.text}</p>
                        <footer className="blockquote-footer">
                            <small>
                                <strong>Source : </strong> {source}
                            </small>
                            {
                                /* Display additional info only if it is available */
                                this.props.snippetData.add_info && <p style={{marginBottom : "0"}}>
                                    <small>
                                        <i className="fa fa-info-circle me-2" aria-hidden="true"></i>
                                        {this.props.snippetData.add_info}
                                    </small>
                                </p>
                            }
                        </footer>
                    </blockquote>
                </div>
                <div className="card-footer text-muted">
                    <div className="tags-like-wrapper">
                        <div className="tags-wrapper">
                            Tags : 
                            {this.props.snippetData.tags.map((tagObj) => {
                                return <span key={tagObj.name} className="badge text-bg-secondary mx-1">{tagObj.name}</span>
                            })}
                        </div>
                        <div>
                            <a onClick={this.changeLikeStatus}>
                                <i className="fa fa-heart like-icon" style={{color: this.state.like_status ? 'red' : 'grey'}}></i>
                            </a> {this.state.like_count} {this.state.like_count == 1 ? 'like' : 'likes'}
                        </div>
                    </div>
                    <div className="author-details-wrapper d-flex justify-content-between align-items-center">
                        <span><small>Posted by u/{this.props.snippetData.owner.username} on {formattedPostDate}</small></span>
                        { // show the edit and delete button only to the owner of snippet
                        this.props.snippetData.is_owner && 
                        <div className="d-flex align-items-center">
                            <Link className='edit-btn me-2' to={`/edit?id=${this.props.snippetData.id}`}>
                                <small><i className="fa fa-pencil me-1"></i>Edit</small>
                            </Link>
                            <button type="button" className="btn btn-outline-danger btn-sm delete-btn" data-bs-toggle="modal" data-bs-target="#cardDeleteModal" 
                            onClick={() => this.props.setSnippetForDeletion(this.props.snippetData.id)}>
                                <i className="fa fa-trash-o me-1"></i>Delete
                            </button>
                        </div>
                        }
                    </div>
                </div>
                <Toaster />
            </div>
        );
    }
}

export default Card;