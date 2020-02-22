import React from "react";
// import "./GameCol.css";

const style = {
    height: "100%",
    display: "flex",
    flex: 1,
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignContent: "flex-start",
    overflow: "auto"
}

function GameCol(props) {
    const size = props.size.split(" ").map(size => "col-" + size).join(" ");
  
    return (
      <div style={style} className={size}>
        {props.children}
      </div>
    );
  }

export default GameCol;