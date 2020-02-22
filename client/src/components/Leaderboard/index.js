import React from "react";
import "./style.scss";

const Leaderboard = (props) => {
    return (
        <div className="leaderB" style={{
            height: props.height,
            width: props.width
        }}>
            <h4 className="leadHeading">LEADERBOARD</h4>
            <table className="table">
                <thead className="thead-dark">
                    <tr>
                        <th scope="col">Ranking</th>
                        <th scope="col">Name</th>
                        <th scope="col">Wins</th>
                        <th scope="col">Losses</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.leaders.slice(0, 5).map((user, index) => {
                            return (
                                <tr key={index + 1}>
                                    <td>{index + 1}</td>
                                    <td>{user.username}</td>
                                    <td>{user.totalWins}</td>
                                    <td>{user.totalLosses}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>
    )
};


export default Leaderboard;