import React, { Component } from 'react';
import { connect }          from 'react-redux'; 
import _                    from 'lodash';
import Board                from 'board';
import Players              from 'players';
import * as actionTypes     from '../../store/actionTypes';
  
import './Table.css';

class Table extends Component {
    render() {
        if (this.props.tbl.openBoardCards) {
            // console.log('open next card');
            this.props.updatePotsNumber();
            this.props.openAllBoardCards(0);
            
            if (this.props.tbl.potsCount >= 5) {
                this.props.areAllBoardCardsOpen();
            }

            this.props.resetOpenCardsFlags();
        }

        if (this.props.tbl.openAllBoardCards) {
            // console.log('open all cards');
            this.props.updatePotsNumber();
            this.props.openAllBoardCards(1);
            this.props.areAllBoardCardsOpen();
            this.props.resetOpenCardsFlags();
        }

        if (this.props.tbl.potsCount >= 5) {
            // console.log('check for winner no matter what');
            this.props.resetPotsNumber();
            this.props.openAllBoardCards(1);
            this.props.areAllBoardCardsOpen();
            this.props.resetOpenCardsFlags();
            this.props.setNoneAsNextPlayer();
        }

        return (
            <div>
                <div className='window-class'>
                    <div className='table-wrapper'>
                        {
                            this.props.tbl.players.map((player, index) => {
                                return (
                                    <div key={index}>
                                        <div id={`seat-${player.seq + 1}`} className='seat'>
                                            <strong>
                                                <div className='seat-lbl'>
                                                    {
                                                        player.isDealer 
                                                        ? `Player ${player.seq + 1} (Dealer)`
                                                            : player.isSmallBlind 
                                                                ? `Player ${player.seq + 1} (Small Blind)` 
                                                                : player.isBigBlind ? `Player ${player.seq + 1} (Big Blind)` 
                                                        : `Player ${player.seq + 1}`
                                                    }
                                                </div>
                                            </strong>
                                        </div>
                                    </div>
                                );
                            })
                        }

                        <strong><div className='center'>{`Sum: ${this.props.tbl.tablePot}`}</div></strong>
                        
                        <div className='Table'>
                            <Players />
                            <Board />
                        </div>
                    </div>
                </div> 
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
        openAllBoardCards   : (openAll)                   => dispatch({type: actionTypes.OPEN_CARDS,               payload: openAll}),
        resetOpenCardsFlags : ()                          => dispatch({type: actionTypes.RESET_OPEN_CARDS_FLAGS}),
        areAllBoardCardsOpen: ()                          => dispatch({type: actionTypes.ALL_BOARD_CARDS_OPEN}),
        getWinner           : (cardsBySuit, cardsByValue) => dispatch({type: actionTypes.GET_WINNER,               payload: {cardsBySuit: cardsBySuit, cardsByValue: cardsByValue}}),
        resetWinners        : ()                          => dispatch({type: actionTypes.RESET_WINNERS}),
        resetRound          : ()                          => dispatch({type: actionTypes.RESET_ROUND}),
        updatePotsNumber    : ()                          => dispatch({type: actionTypes.UPDATE_POTS_COUNT}),
        resetPotsNumber     : ()                          => dispatch({type: actionTypes.RESET_POTS_COUNT}),
        setNoneAsNextPlayer : ()                          => dispatch({type: actionTypes.NONE_NEXT_PLAYER})
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Table);
