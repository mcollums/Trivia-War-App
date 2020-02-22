import React from 'react';
import './style.scss';

const GameCard = props => (
        <div id={props.answer} 
             onClick={() => props.handleSelection(props.id)} 
             className="spAnswer" >
            <h3>{props.id}</h3>
        </div>
);


export default GameCard;