import React from "react";
import CreatableSelect from 'react-select/creatable';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from "react-router-dom";

class SnippetCreationForm extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            tags : [],
            selectedTags : [],
            mode : '',
            showForm : true,
            snippet_id : null
        }
    }

    selectRef = null;

    // for clearing the react-select component
    clearForm = () => {
        document.getElementById("create-snippet-form").reset();
        this.setState({selectedTags : []});
        this.selectRef.clearValue();
    }

    fetchTags = () => {
        fetch('/api/fetchtags/')
        .then((response) => response.json())
        .then((actualData) => {
            let tagList = []
            actualData.map((element) => tagList.push({value : element.name, label : element.name}));
            this.setState({tags : tagList});
        })
        .catch((error) => console.log(`ERROR => ${error}`))
    }

    fetchSnippetData = (snippet_id) => {
        fetch(`/api/retrievesnippetdata/${snippet_id}/`)
        .then((response) => {
            if(!response.ok) {
                this.setState({showForm : false});
                return;
            }
            response.json().then((data) => {
                // set the form data
                let textInput = document.getElementById('snippet-text-input');
                let bookInput = document.getElementById('book-input');
                let authorInput = document.getElementById('author-input');
                let infoInput = document.getElementById('add-info-input');
                
                textInput.value = data.text;
                bookInput.value = data.book;
                authorInput.value = data.author;
                infoInput.value = data.add_info;
                
                // set the selected tags with the value of incoming tags. Then in the 
                // react-select component we will handle the modifications to this 
                // array with a handler which is called onChange.
                let tempArr = [];
                data.tags.map((element) => tempArr.push({value : element.name, label : element.name}));
                this.setState({selectedTags : tempArr});
            })
        })
        .catch((error) => console.log(`ERROR => ${error}`))
    }

    componentDidMount() {
        this.fetchTags();
        
        let url_string = window.location.href;
        let url = new URL(url_string);
        let snippet_id = url.searchParams.get('id');

        if(snippet_id) {
            this.setState({mode : 'edit', snippet_id : snippet_id});
            this.fetchSnippetData(snippet_id);
        }
        else {
            this.setState({mode : 'create'});
        }
    }

    createUpdateSnippet = () => {
        // setting the manadatory fields
        let tags = []
        this.state.selectedTags.map((element) => tags.push(element.value));
        let text = document.getElementById("snippet-text-input").value.trim();

        // raising errors if the mandatory fields are not set
        if(text == "") {
            toast.error('Snippet text cannot be empty.', {
                position: 'top-right',
            });
            return;
        }
        if(!tags.length) {
            toast.error('Please select at-least 1 tag.', {
                position: 'top-right',
            });
            return;
        }

        // setting optional fields data
        let book = document.getElementById("book-input").value.trim();
        let author = document.getElementById("author-input").value.trim();
        let add_info = document.getElementById("add-info-input").value.trim();
        
        // post the data to create endpoint
        let token = localStorage.getItem('token');
        if(!token) {
            toast.error('User token missing!', {
                position: 'top-right',
            });
            return;
        }

        // Based on the mode, create or update snippet
        let successMsg, url = '';
        if(this.state.mode == 'create') {
            successMsg = 'Snippet created successfully';
            url = 'api/create/' ;
        }
        else {
            successMsg = 'Snippet updated successfully. Redirecting ...';
            url = 'api/edit/' ;
        }

        fetch(url, {
            method : "POST",
            headers : {
                'Content-Type' : 'application/JSON',
                'Authorization' : `Token ${token}`
            },
            body : JSON.stringify({
                text : text,
                book : book,
                author : author,
                add_info : add_info,
                tags : tags,
                snippet_id : this.state.snippet_id
            })
        })
        .then((response) => {
            if(response.ok) {
                toast.success(successMsg, {
                    position: 'top-right',
                });

                // If mode is edit then redirect after showing success
                if(this.state.mode == 'edit') {
                    setTimeout(function(){
                        window.location.href = '/';
                     }, 1000);
                }

                this.clearForm();
                this.fetchTags();
            }
            else {
                // Some sort of bad request or server error
                response.json().then((data) => {
                    let msg = "";
                    for(const field in data) {
                        msg = msg + `${field} - ${data[field]} `;
                    }
                    toast.error(msg, {
                        position: 'top-right',
                    });
                });
            }
        })
        .catch((error) => console.log(`ERROR => ${error}`))
    }

    handleTagInputChange = (selectedOptions) => {
        this.setState({ selectedTags : selectedOptions });
    }

    render() {
        return (
            <div className="container-md my-4">
                {this.state.showForm &&
                <div className="card">
                    <div className="card-header">
                        { // header when creating snippet
                        this.state.mode == 'create' && <h4 className="my-2">
                            <i className="fa fa-plus-circle me-2"></i>
                            <strong>Create a text snippet</strong>
                        </h4>
                        }
                        { // header when updating snippet
                        this.state.mode == 'edit' && <h4 className="my-2">
                            <i className="fa fa-pencil-square-o me-2"></i>
                            <strong>Edit text snippet</strong>
                        </h4>
                        }
                    </div>
                    <div className="card-body">
                        <form id="create-snippet-form">
                            <div className="mb-3">
                                <label htmlFor="snippet-text-input" className="form-label">Snippet Text</label>
                                <textarea className="form-control" rows="5" id="snippet-text-input"></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="book-input" className="form-label">Book <span className="form-text">(Optional)</span></label>
                                <input type="text" className="form-control" id="book-input"></input>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="author-input" className="form-label">Author <span className="form-text">(Optional)</span></label>
                                <input type="text" className="form-control" id="author-input"></input>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="add-info-input" className="form-label">Notes <span className="form-text">(Optional)</span></label>
                                <textarea className="form-control" rows="3" id="add-info-input"></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Tags</label>
                                <CreatableSelect isMulti 
                                ref={ref => {
                                    this.selectRef = ref;
                                }}
                                value = {this.state.selectedTags}
                                onChange={this.handleTagInputChange}
                                options={this.state.tags}/>
                            </div>
                        </form>
                    </div>
                    <div className="card-footer d-flex justify-content-end">
                        { // when creating cancel will only clear the form
                        this.state.mode == 'create' && 
                        <button type="button" className="btn btn-outline-secondary me-2" onClick={this.clearForm}>Cancel</button>
                        }

                        { // when editing it takes to the home page
                        this.state.mode != 'create' &&
                        <Link className="btn btn-outline-secondary me-2" to="/">Cancel</Link>
                        }

                        <button type="button" className="btn btn-primary" onClick={this.createUpdateSnippet}>
                            {this.state.mode == 'create' && <>Create</>}
                            {this.state.mode != 'create' && <>Edit</>}
                        </button>
                    </div>
                </div>
                }

                {!this.state.showForm && 
                <div className="card">
                    <div className="card-body">
                        <h3>Oops! Invalid snippet id.</h3>
                    </div>
                </div>
                }
                <Toaster />
            </div>
        )
    }
}

export default SnippetCreationForm;