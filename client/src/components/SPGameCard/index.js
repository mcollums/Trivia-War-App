import React from 'react';
import './style.scss';

import { Card } from 'react-bootstrap';

const SPGameCard = props => (
    <Card   id={props.id}
            className="scategory"
            onClick={() => props.loadPage(props.id)}>
        <Card.Img variant="top" src={props.image} />
        <Card.Body>
            <Card.Title>{props.category}</Card.Title>
        </Card.Body>
    </Card>
);

export default SPGameCard;