import React, { Component } from "react";
import '../styles/Authentication.scss'
import { Container, Row } from 'react-bootstrap';
import API from "../utils/API";
import SPGameCard from "../components/SPGameCard";
import SPGameContainer from './SP-game-cont';


class SingleCategory extends Component {
    state = {
        cat: [],
        id: "5d51e88288f77f973b8e7908"
    };

    componentDidMount() {
        API.getGames()
            .then(res => {
                this.setState ({
                    cat: res.data
                });
        });
    }

    loadPage = (id) => {
        this.setState({ id: id });
    };


    render() {
        return (
            <>
                {this.state.id === "" 
                // If there is no category selected, show all the available catagories.
                ? (
                    <Container className="scatContain">
                        <Row className="d-flex justify-content-around">
                        {this.state.cat.map((c, i) => (
                            <SPGameCard
                                id={c._id}
                                key={i}
                                category={c.category}
                                image={c.image}
                                loadPage={this.loadPage}
                            />
                        ))}
                        </Row>
                    </Container>
                ) 
                // Otherwise, show the game container
                : (<SPGameContainer id={this.state.id} />)}
            </>
        )
    };

}


export default SingleCategory;
