import React from "react";
import IllustrationCard from './IllustrationCard';
import ActionBar from './ActionBar';
import Card from './Card';
import toast, { Toaster } from 'react-hot-toast';
import no_data from './no_data.svg'

class Home extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            data : [],
            dataCount : 0,
            dataFetched : false,
            nextPageUrl : null,
            prevPageUrl : null,
            sortOrder : 1, // 1 is for by date of creation and 2 is for most liked
            mySnippets : 0,
            deleteSnippetId : null
        }
    }

    // Method to fetch the snippet lists data
    fetchData(url) {
        // We get the url when we click next, prev for pagination
        if(!url) {
            url = `api/?my=${this.state.mySnippets}&o=${this.state.sortOrder}`;

            // If we are getting some search query then add it to the get params
            if(this.props.query.trim() != '') {
                url = url + `&q=${this.props.query}&t=${this.props.queryType}`;
            }
        }

        // Authoriztion header should be there only if user is logged in
        let token = localStorage.getItem('token');
        let headers = {}
        if(token) {
            headers = {
                'Authorization' : `Token ${token}`
            }
        }

        // fetch the data
        fetch(url, {
            method : 'GET',
            headers : headers
        })
        .then((response) => response.json())
        .then((actualData) => {
            this.setState({
                data : actualData.results,
                dataCount : actualData.count,
                dataFetched : true,
                nextPageUrl : actualData.next,
                prevPageUrl : actualData.previous,
            })
        })
        .catch((error) => console.log(`ERROR : ${error}`))
    }

    // Method to change the snippet order
    changeSnippetListOrder = (value) => {
        this.setState({sortOrder : value}, () => {
            this.fetchData();
        });
    }

    // Method called when user clicks my snippets tab or all snippets tab
    // List type 0 - All Snippets; List type 1 - My snippets 
    fetchSnippets = (listType) => {
        this.setState({mySnippets : listType}, () => {
            this.fetchData();
        });
    }

    // Sets the snippet id that is to be deleted
    setSnippetForDeletion = (id) => {
        this.setState({deleteSnippetId : id});
    }

    // Sends the request for snippet deletion
    deleteSnippet = () => {
        let token = localStorage.getItem('token');
        fetch('api/delete/', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/JSON',
                'Authorization' : `Token ${token}`
            },
            body : JSON.stringify({
                'id' : this.state.deleteSnippetId
            })
        })
        .then((response) => response.json())
        .then((data) => {
            if(data.error) {
                toast.error(data.message, {
                    position: 'top-right',
                });
                return;
            }

            this.fetchData();
            toast.success(data.message, {
                position: 'top-right',
            });
            this.setState({deleteSnippetId : null});
        })
        .catch((error) => console.log(`ERROR => ${error}`))
    }

    // When component mounts fetch the snippets lists data
    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate() {
        if (!this.props.clickedSearch) return;

        // first turn off the search, otherwise fetch will be called 
        // whenever the component updates.
        this.props.turnOffSearch();
        this.fetchData();        
    }
    
    render() {
        return (
            <div className="App">
                { // If user is logged in then no need to show illustration card
                !this.props.loggedInStatus && <IllustrationCard />
                }

                <ActionBar loggedInStatus = {this.props.loggedInStatus} 
                    changeSnippetListOrder = {this.changeSnippetListOrder} 
                    sortOrder = {this.state.sortOrder}
                    fetchSnippets = {this.fetchSnippets}
                    dataCount = {this.state.dataCount}
                />
                
                { this.state.dataCount == 0 && this.state.dataFetched &&
                <div className="container-md d-flex flex-column justify-content-center align-items-center mt-3">
                    <img src={no_data} height="300"></img>
                    <h3 className="mt-2">Oops! No data found.</h3>
                </div>
                }
                
                <div className="container-md my-4">
                    {this.state.data.map((datum) => {
                        return <Card key={datum.id} 
                                    snippetData={datum} 
                                    setSnippetForDeletion={this.setSnippetForDeletion}/>
                    })}
                </div>
                
                {this.state.dataCount > 0 && 
                <div className="container-md mb-4 d-flex justify-content-end">
                    <button type="button" className="btn btn-secondary btn-sm me-2" 
                    disabled={this.state.prevPageUrl == null} 
                    onClick={() => this.fetchData(this.state.prevPageUrl)}>Prev</button>
                    <button type="button" className="btn btn-primary btn-sm" 
                    disabled={this.state.nextPageUrl == null}
                    onClick={() => this.fetchData(this.state.nextPageUrl)}>Next</button>
                </div>
                }

                {/* Delete a snippet modal */}
                <div className="modal fade" id="cardDeleteModal" data-bs-backdrop="static" 
                data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="staticBackdropLabel">Delete snippet</h5>
                            </div>
                            <div className="modal-body">
                                Are you sure to delete this snippet with id {this.state.deleteSnippetId}?
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" 
                                onClick={() => this.setState({deleteSnippetId : null})}>Cancel</button>
                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" 
                                onClick={this.deleteSnippet}>Delete</button>
                            </div>
                        </div>
                    </div>
                </div>

                <Toaster />
            </div>
        )
    }
}

export default Home;
