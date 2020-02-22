import React from "react";
import "./style.css";

const styles = {
    marginTop: "20px",
    borderColor: "grey"
}

const MPGameCard = props => (

    <div>
        <div style={styles} id={props.answer} onClick={() => props.publishPlayerSelect(props.id)} className="card grow mpAnswer" >
            <h3 className="mpAnswer">{props.id}</h3>
        </div>
    </div>

);


export default MPGameCard;