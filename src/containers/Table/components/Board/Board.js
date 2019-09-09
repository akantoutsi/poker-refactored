import React, { Component } from 'react';
import { connect }          from 'react-redux';
import Card                 from 'card';
import _                    from 'lodash';
import * as actionTypes     from '../../../../store/actionTypes';

import './Board.css';

class Board extends Component {
    shuffleCards = arr => {
        for (let i = 0; i < arr.length; i++) {
          const rnd = Math.random() * i | 0;
          const tmp = arr[i];
          arr[i]    = arr[rnd];
          arr[rnd]  = tmp;
        }
        return arr;
    };

    getRank = (obj, property) => {
        let rank = 0;
        
        if (obj[property] === 'J') {
            rank = 11;  
        } else if (obj[property] === 'Q') {
            rank = 12;  
        } else if (obj[property] === 'K') {
            rank = 13;  
        } else if (obj[property] === 'A') {
            rank = 14;  
        } else {
            rank = parseInt(obj[property]);
        }
        
        return rank;
    };

    render() { 
        const allCards  = <div className='card back'>*</div>;
        
        let cards         = [];
        let player        = [];
        let boardCards    = [];
        let firstPlayerId = null;
        let j             = 0;
        let dealerId      = -1;

        cards = _.cloneDeep(this.props.tbl.initCards);
        cards.map(elem => elem.rank = this.getRank(elem, 'value'));
        cards.map(elem => elem.isVisible = false);
        this.shuffleCards(cards);

        for (let i=0; i<actionTypes.NUM_OF_PLAYERS; i++) {
            dealerId          = (this.props.tbl.dealerId + 1 >= actionTypes.NUM_OF_PLAYERS) 
                              ?  this.props.tbl.dealerId + 1 - actionTypes.NUM_OF_PLAYERS 
                              :  this.props.tbl.dealerId + 1

            let smallBlindId  = (dealerId + 1 >= actionTypes.NUM_OF_PLAYERS) 
                              ?  dealerId + 1 - actionTypes.NUM_OF_PLAYERS     
                              :  dealerId + 1;

            let bigBlindId    = (dealerId + 2 >= actionTypes.NUM_OF_PLAYERS) 
                              ?  dealerId + 2 - actionTypes.NUM_OF_PLAYERS 
                              :  dealerId + 2;

            firstPlayerId     = (bigBlindId + 1 >= actionTypes.NUM_OF_PLAYERS)
                              ?  bigBlindId + 1 - actionTypes.NUM_OF_PLAYERS 
                              :  bigBlindId + 1;

            let nextPlayerId  = (bigBlindId + 1 >= actionTypes.NUM_OF_PLAYERS) 
                              ?  bigBlindId + 1 - actionTypes.NUM_OF_PLAYERS
                              :  bigBlindId + 1

            let cash = Math.floor(Math.random() * (20 - actionTypes.SMALL_BLIND_AMOUNT*2)) + (actionTypes.SMALL_BLIND_AMOUNT*2);                    

            player.push({
                cards           : cards.slice(i+j, i+j+2).map(elem => ({...elem, belongsTo: i, selected: false})),
                seq             : i,
                cash            : (smallBlindId === i) ? cash - actionTypes.SMALL_BLIND_AMOUNT : 
                                    (bigBlindId === i) ? cash - actionTypes.SMALL_BLIND_AMOUNT*2 : cash,
                isActive        : 1,
                nextPlayer      : (i === nextPlayerId) ? 1 : 0,
                pot             : 0,
                potNotLessThan  : 0,
                maxPot          : cash,
                changedPot      : 0,
                smallBlindAmount: actionTypes.SMALL_BLIND_AMOUNT,
                isDealer        : dealerId === i,
                isSmallBlind    : smallBlindId === i,
                isBigBlind      : bigBlindId === i,
                previousPot     : (smallBlindId === i) ? actionTypes.SMALL_BLIND_AMOUNT : 
                                    (bigBlindId === i) ? actionTypes.SMALL_BLIND_AMOUNT*2 : 0
            });
            j += 1;
        }

        boardCards = cards.slice(j*2, (j*2)+5);

        return (
            <div className='Board'> 
                {
                    this.props.tbl.cards.map((card, index) => {
                        return (
                            <div className='playingCards' key={index}>
                                {   
                                    (!card.isVisible)
                                    ? <div className='card back'>*</div>
                                    : <Card value={card.value} suit={card.suit} openedCards={1} selected={card.selected} />
                                }
                            </div>
                        );
                    })
                }

                <div className='playingCards all-cards' 
                    onClick={() => this.props.tbl.round === 0 ? (this.props.resetBoardCards(),
                                                                 this.props.resetPlayers(),
                                                                 this.props.setDealer(dealerId),
                                                                 this.props.storeBoardCards(boardCards), 
                                                                 this.props.startGame(), 
                                                                 this.props.updatePotsNumber(),
                                                                 this.props.storePlayersCards(player),
                                                                 this.props.setFirstPlayer(firstPlayerId),
                                                                 this.props.updateCurrentPot(),
                                                                 this.props.resetTablePot(),
                                                                 this.props.setTablePot()) : null}>
                    {allCards}
                    <div className='clear'></div>
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
        setDealer        : (dealerId)      => dispatch({type: actionTypes.SET_DEALER,                       payload: dealerId}),
        storeBoardCards  : (boardCards)    => dispatch({type: actionTypes.STORE_BOARD_CARDS,                payload: boardCards}),
        startGame        : ()              => dispatch({type: actionTypes.START_GAME}),
        updatePotsNumber : ()              => dispatch({type: actionTypes.UPDATE_POTS_COUNT}),
        storePlayersCards: (playersCards)  => dispatch({type: actionTypes.STORE_PLAYERS_CARDS,              payload: playersCards}),
        setFirstPlayer   : (firstPlayerId) => dispatch({type: actionTypes.SET_FIRST_PLAYER,                 payload: firstPlayerId}),
        updateCurrentPot : ()              => dispatch({type: actionTypes.UPDATE_ALL_PLAYERS_CURRENT_POT}),
        resetTablePot    : ()              => dispatch({type: actionTypes.RESET_TABLE_POT}),
        setTablePot      : ()              => dispatch({type: actionTypes.SET_TABLE_POT}),
        resetBoardCards  : ()              => dispatch({type: actionTypes.RESET_BOARD_CARDS}),
        resetPlayers     : ()              => dispatch({type: actionTypes.RESET_PLAYERS}),
        resetWinners     : ()              => dispatch({type: actionTypes.RESET_WINNERS}),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Board);
