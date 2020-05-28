import React from "react";
import { Card } from 'react-bootstrap';
import './style.scss';


const styles = {
    // marginTop: "30px",
    // width: "18rem"

}

const MPCategory = props => (
    <Card id={props.id}
        className="scategory"
        onClick={() => props.handleSelect(props.id)}>
        <Card.Img variant="top" src={props.image} />
        <Card.Body>
            <Card.Title>{props.category}</Card.Title>
        </Card.Body>
    </Card>
);
export default MPCategory;