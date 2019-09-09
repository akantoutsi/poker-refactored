import React, { Component } from 'react';
import { connect }          from 'react-redux'; 
import Player               from 'player';
import * as actionTypes     from '../../../../store/actionTypes';

import './Players.css';

class Players extends Component {
    render() { 
        return (
            <div> 
                {
                    this.props.tbl.players.map((player, index) => {
                        return (
                            <div key={index}>
                                <Player player={player} 
                                        nextPlayer      ={(this.props.tbl.firstPlayerId !== null) 
                                                        ? this.props.tbl.firstPlayerId 
                                                        : ( (player.nextPlayer === 1) ? player.seq : null )}
                                        incrementPot    ={(playerId) => this.props.incrementPot(playerId)} 
                                        decrementPot    ={(playerId) => this.props.decrementPot(playerId)} 
                                        exitGame        ={(playerId) => this.props.exitGame(playerId)} 
                                        setNextPlayer   ={(playerId) => this.props.setNextPlayer(playerId)}
                                        updateCurrentPot={()         => this.props.updateCurrentPot()}
                                        setTablePot     ={()         => this.props.setTablePot()}
                                        resetFirstPlayer={()         => this.props.resetFirstPlayer()}
                                        selected        ={this.props.selected} 
                                />
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        tbl: state.table
    };
};

const mapDispatchToProps = dispatch => {
    return {
        incrementPot    : (playerId) => dispatch({type: actionTypes.INCREMENT_PLAYER_POT, payload:    playerId}),
        decrementPot    : (playerId) => dispatch({type: actionTypes.DECREMENT_PLAYER_POT, payload:    playerId}),
        exitGame        : (playerId) => dispatch({type: actionTypes.EXIT_GAME,                        payload: playerId}),
        updateCurrentPot: ()         => dispatch({type: actionTypes.UPDATE_ALL_PLAYERS_CURRENT_POT}),
        setTablePot     : ()         => dispatch({type: actionTypes.SET_TABLE_POT}),
        setNextPlayer   : (playerId) => dispatch({type: actionTypes.SET_NEXT_PLAYER,                  payload: playerId}),
        resetFirstPlayer: ()         => dispatch({type: actionTypes.RESET_FIRST_PLAYER})
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Players);
