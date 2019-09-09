import * as actionTypes from '../actionTypes';
import _                from 'lodash';
import { createCards, cardsToOpen, checkIfAll, shouldCheckForWinner, findWinner, updateObjectInArray, findMaxPot, allHaveSamePot, formatCards, printWinners, getWinnerIds } from '../utils';

const initialState = {
    round: 0,
    dealerId: -1,
    cardCombinations: [
        { code: 1,  title: 'Royal Flush'     },
        { code: 2,  title: 'Straight Flush'  },
        { code: 3,  title: 'Four of a Kind'  },
        { code: 4,  title: 'Full House'      },
        { code: 5,  title: 'Flush'           },
        { code: 6,  title: 'Straight'        },
        { code: 7,  title: 'Three of a Kind' },
        { code: 8,  title: 'Two Pairs'       },
        { code: 9,  title: 'Pair'            },
        { code: 10, title: 'High Card'       }
    ],
    initCards: createCards(),
    numOfPlayers: actionTypes.NUM_OF_PLAYERS,
    firstPlayerId: null,
    checkForWinner: 0,
    winCombinations: [],
    cards: [],
    canUpdateTablePot: 1,
    openBoardCards: 0,
    openAllBoardCards: 0,
    alreadyOpenedCards: 0,
    players: [],
    possibleWinners: [],
    tablePot: 0,
    potsCount: 0,
    howManyPlayersChecked: 0
};

const tableReducer = (state = initialState, action) => {
    let cards                 = [];
    let updatedCards          = [];
    let checkForWinner        = 0;
    let winCombinations       = [];
    let openBoardCards        = 0;
    let openAllBoardCards     = 0;
    let alreadyOpenedCards    = 0;
    let maxPot                = 0;
    let activePlayers         = [];
    let possibleWinners       = [];
    let tablePot              = 0;
    let potsCount             = 0;
    let howManyPlayersChecked = 0;
    let boardCards            = [];
    let players;
    let restPlayers;
    let player;
    let currentPlayer;
    let playerId;
    let canUpdateTablePot;

    switch (action.type) {
        case actionTypes.START_GAME:
            return {
                ...state,
                round: 1
            }

        case actionTypes.SET_DEALER:
            return {
                ...state,
                dealerId: action.payload
            }

        case actionTypes.RESET_BOARD_CARDS:
            cards = [];
            
            return {
                ...state,
                cards: cards,
            }

        case actionTypes.STORE_BOARD_CARDS:
            return {
                ...state,
                cards: state.cards.concat(action.payload)
            }

        case actionTypes.SET_FIRST_PLAYER:
            return {
                ...state,
                firstPlayerId: action.payload
            }

        case actionTypes.RESET_FIRST_PLAYER:
            return {
                ...state,
                firstPlayerId: null
            }

        case actionTypes.OPEN_CARDS:
            cards        = [...state.cards];
            updatedCards = cardsToOpen(cards, 'isVisible', action.payload);
            
            return {
                ...state,
                cards: updatedCards
            }

        case actionTypes.ALL_BOARD_CARDS_OPEN:
            cards          = [...state.cards];
            // checkForWinner = shouldCheckForWinner(cards, 'isVisible') === cards.length;
            checkForWinner = checkIfAll(cards, 'isVisible', true) === cards.length;
            boardCards     = [...state.cards];
            players        = [...state.players];

            if (checkForWinner) {
                potsCount = state.potsCount;
                potsCount = 0;
                let updatedBoardCards = state.cards.slice();
                let cardsToCheck = state.possibleWinners.map(elem => {
                    return elem.cards.concat(updatedBoardCards.map(el => ({...el, belongsTo: elem.cards[0].belongsTo, isBoard: true})));
                });

                let e = cardsToCheck.map(el => formatCards(el));
                let result = printWinners(e);

                if (result.length >= 1) {
                    let res       = result.map(elem => elem[0][0]);
                    let bestCards = _.orderBy(res);

                    let bestCombNum = bestCards.reduce((acc, elem) => { 
                        acc = (elem.typeOfCombination > acc) ? acc : elem.typeOfCombination; 
                        return acc; 
                    }, bestCards[0].typeOfCombination);

                    let winCombinations = bestCards.filter(elem => elem.typeOfCombination === bestCombNum);
                    let comb            = state.cardCombinations.filter(elem => elem.code === bestCombNum);
                    let winnerIds       = getWinnerIds(winCombinations);

                    alert(`The winning combination is ${_.get(comb[0], 'title')}. Winner(s) are player(s): ${winnerIds.map(elem => elem + 1)}`);
        
                    let winnerCards = winCombinations.map(elem => elem.slice(0, elem[0].typeOfCombination));
        
                    let updatedWinnerCards = winnerCards.map(elem => elem.map(el => ({...el, selected: true})));
        
                    // console.log(updatedWinnerCards);

                    updatedWinnerCards.map(elem => elem.map(el => el.isBoard ? (boardCards.filter(e => e.value === el.value && e.suit === el.suit ? e.selected = true : null)) : null));
                    updatedWinnerCards.map(elem => elem.map(el => !el.isBoard ? players.map(pl => pl.cards.filter(e => e.value === el.value && e.suit === el.suit ? e.selected = true : null)) : null));

                    winCombinations = [];
                    checkForWinner  = 0;
                } 
            }

            return {
                ...state,
                checkForWinner: checkForWinner,
                potsCount: potsCount,
                winCombinations: winCombinations,
                checkForWinner: checkForWinner,
                cards: boardCards,
                players: players,
                round: 0
            }

        case actionTypes.GET_WINNER:
            winCombinations = [...state.winCombinations];
            checkForWinner  = 0;

            let a = findWinner(action.payload.cardsBySuit, action.payload.cardsByValue);
            winCombinations.push(a);
              
            return {
                ...state,
                checkForWinner: checkForWinner,
                winCombinations: winCombinations
            }

            case actionTypes.UPDATE_POTS_COUNT:
                players   = [...state.players];
                potsCount = state.potsCount;
                potsCount += 1;
    
                let tmp = players.map(elem => ({...elem, changedPot: 0}));
    
                return {
                    ...state,
                    players: tmp,
                    potsCount: potsCount
                }
    
            case actionTypes.RESET_PLAYERS:
                players = [];
                
                return {
                    ...state,
                    players: players
                }
        
            case actionTypes.STORE_PLAYERS_CARDS:
                players = action.payload;
    
                const smallBlindPlayer = players.find(pl => pl.isSmallBlind);
                smallBlindPlayer.pot   = actionTypes.SMALL_BLIND_AMOUNT;
    
                const bigBlindPlayer = players.find(pl => pl.isBigBlind);
                bigBlindPlayer.pot   = actionTypes.SMALL_BLIND_AMOUNT * 2;
    
                updateObjectInArray(players, smallBlindPlayer);
                updateObjectInArray(players, bigBlindPlayer);
    
                return {
                    ...state,
                    players: state.players.concat(players)
                }
    
            case actionTypes.INCREMENT_PLAYER_POT:
                players = [...state.players];
                player  = players.find(pl => pl.seq === action.payload);
    
                if (player.cash > 0 && player.pot >= player.potNotLessThan && player.pot + 1 <= player.maxPot + player.previousPot) {
                    player.pot       += 1; 
                    player.cash      -= 1;
                    player.changedPot = 1;
                }
    
                if (player.cash > 0 && player.pot <= player.potNotLessThan) {
                    if (player.cash >= player.potNotLessThan) {
                        player.pot  = player.potNotLessThan;
                        player.cash = player.cash - (player.potNotLessThan - player.previousPot);
    
                    } else {
                        if (Math.abs(player.potNotLessThan - player.pot) <= player.cash) {
                            player.pot   = player.potNotLessThan;
                            player.cash -= Math.abs(player.potNotLessThan - player.previousPot); 
                        
                        } else {
                            player.pot  = player.pot + player.cash;
                            player.cash = 0;
                        }
                    }
                }
    
                player.changedPot = 1;
    
                if (player.changedPot === 1) {
                    canUpdateTablePot = state.canUpdateTablePot; 
                    canUpdateTablePot = 1; 
                }
    
                updateObjectInArray(players, player);
    
                return {
                    ...state,
                    players: players,
                    canUpdateTablePot: canUpdateTablePot
                }
    
            case actionTypes.DECREMENT_PLAYER_POT:
                players           = [...state.players];
                player            = players.find(pl => pl.seq === action.payload);
                canUpdateTablePot = state.canUpdateTablePot;
    
                if (player.pot - 1 >= player.potNotLessThan) {
                    if (player.pot-1 !== player.previousPot) {
                        player.pot  -= 1; 
                        player.cash += 1;
        
                        updateObjectInArray(players, player);
                        
                        canUpdateTablePot = 1; 
                    }
    
                } else {
                    canUpdateTablePot = 0; 
                }
    
                return {
                    ...state,
                    players: players,
                    canUpdateTablePot: canUpdateTablePot
                }
    
            case actionTypes.EXIT_GAME:
                players                   = [...state.players];
                possibleWinners           = [...state.possibleWinners];
                currentPlayer             = players.find(pl => pl.seq === action.payload);
                currentPlayer.nextPlayer  = 0;
                currentPlayer.isActive    = 0;
                restPlayers               = players.filter(elem => elem.isActive && elem.cash > 0);
                alreadyOpenedCards        = state.alreadyOpenedCards;
                openBoardCards            = state.openBoardCards;
                openAllBoardCards         = state.openAllBoardCards;
                currentPlayer.previousPot = currentPlayer.previousPot;
                currentPlayer.maxPot      = currentPlayer.maxPot;
                howManyPlayersChecked     = state.howManyPlayersChecked;
    
                if (restPlayers.length >= 2) {
                    let hasAnyonePot = restPlayers.reduce((acc, elem) => { acc += (elem.changedPot === 0) ? 0 : 1; return acc; }, 0);
            
                    if (hasAnyonePot === 0) {
                        if (howManyPlayersChecked === restPlayers.length) {
                            openBoardCards        = 1;
                            howManyPlayersChecked = 0;
                        }
        
                        playerId          = restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) !== -1 ? restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) : 0;
                        player            = restPlayers[playerId];
                        player.nextPlayer = 1;
                        player.changedPot = 0;
                    
                    } else {
                        playerId          = restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) !== -1 ? restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) : 0;
                        player            = restPlayers[playerId];
                        player.nextPlayer = 1;
                        player.changedPot = 0;
                        
                        updateObjectInArray(players, player);
    
                        activePlayers = players.filter(elem => elem.isActive);
                        maxPot        = findMaxPot(activePlayers, 'pot');
    
                        if (checkIfAll(restPlayers, 'pot', maxPot) === restPlayers.length && !alreadyOpenedCards) {
                            openBoardCards     = 1;
                            alreadyOpenedCards = 1;
                        }
                    }
                } 
    
                if (restPlayers.length <= 1) {
                    possibleWinners   = players.filter(elem => elem.isActive);
                    openAllBoardCards = 1;
                    // nea function opou tha parei olo to state pou kanw return pio katw wste na mi xreiastei na kalw stin render tou Board to if ()
                    // i function afti tha epistrefei to ananewmeno state to opoio tha epistrefw en telei
                    // dld tha peirazw me ti mia olo to state kai oxi stadiaka opws twra
                    // function()
                }
    
                return {
                    ...state,
                    players: players,
                    openBoardCards: openBoardCards,
                    openAllBoardCards: openAllBoardCards,
                    alreadyOpenedCards: alreadyOpenedCards,
                    possibleWinners: possibleWinners,
                    howManyPlayersChecked: howManyPlayersChecked
                }
    
            case actionTypes.UPDATE_ALL_PLAYERS_CURRENT_POT:
                players       = [...state.players];
                activePlayers = players.filter(elem => elem.isActive && elem.cash >= 0);
    
                if (state.canUpdateTablePot === 1) {   
                    const currentPot = findMaxPot(activePlayers, 'pot');
    
                    players.map(pl => {
                        return pl.potNotLessThan = currentPot;
                    });    
                }
    
                return {
                    ...state,
                    players: players
                }
    
            case actionTypes.RESET_TABLE_POT:
                tablePot = 0;
    
                return {
                    ...state,
                    tablePot: tablePot
                }
    
            case actionTypes.SET_TABLE_POT:
                players       = [...state.players];
                activePlayers = players.filter(elem => elem.isActive && elem.cash >= 0);
                tablePot      = activePlayers.reduce((acc, elem) => { acc += elem.pot; return acc; }, 0);
    
                return {
                    ...state,
                    tablePot: tablePot
                }
    
            case actionTypes.SET_NEXT_PLAYER:
                players                   = [...state.players];
                possibleWinners           = [...state.possibleWinners];
                currentPlayer             = players.find(pl => pl.seq === action.payload);
                restPlayers               = players.filter(elem => elem.isActive && elem.cash > 0);
                openBoardCards            = state.openBoardCards;
                openAllBoardCards         = state.openAllBoardCards;
                alreadyOpenedCards        = state.alreadyOpenedCards;
                alreadyOpenedCards        = 0;
                currentPlayer.previousPot = currentPlayer.pot;
                currentPlayer.maxPot      = currentPlayer.cash;
                canUpdateTablePot         = state.canUpdateTablePot;
                potsCount                 = state.potsCount;
                howManyPlayersChecked     = state.howManyPlayersChecked;
    
                if ((currentPlayer.pot >= currentPlayer.potNotLessThan || currentPlayer.cash === 0) && currentPlayer.changedPot === 1) { 
                    howManyPlayersChecked = 0;
    
                    if (restPlayers.length >= 2) {
                        playerId                 = restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) !== -1 ? restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) : 0;
                        player                   = restPlayers[playerId];
                        player.nextPlayer        = 1;
                        currentPlayer.nextPlayer = 0;
                        currentPlayer.changedPot = 1;
    
                        updateObjectInArray(players, player);
                        activePlayers = players.filter(elem => elem.isActive);
                        maxPot        = findMaxPot(activePlayers, 'pot');
    
                        if (checkIfAll(restPlayers, 'pot', maxPot) === restPlayers.length && !alreadyOpenedCards) {
                            openBoardCards     = 1;
                            alreadyOpenedCards = 1;
                        }
                    } 
                    
                    if (restPlayers.length === 0) {
                        // alert('next - vres nikiti');
                        currentPlayer.nextPlayer = 0;
                        possibleWinners          = players.filter(elem => elem.isActive);
                        openAllBoardCards        = 1;
                    } 
    
                    if (restPlayers.length === 1 && currentPlayer.cash >= 0) {
                        if (restPlayers[0].changedPot === 0) {
                            currentPlayer.nextPlayer  = 0;
                            restPlayers[0].nextPlayer = 1;
                            restPlayers[0].changedPot = 1;
                        
                        } else {
                            currentPlayer.nextPlayer = 0;
                            // alert('next - vres nikiti');
                            possibleWinners   = players.filter(elem => elem.isActive);
                            openAllBoardCards = 1;
                        }
                    } 
                    
                    possibleWinners   = players.filter(elem => elem.isActive);
                    canUpdateTablePot = 1;
    
                
                } else {
                    let hasAnyonePot = restPlayers.reduce((acc, elem) => { acc += (elem.changedPot === 0) ? 0 : 1; return acc; }, 0);
                    
                    if (hasAnyonePot === 0) {
                        howManyPlayersChecked += 1;
    
                        if (howManyPlayersChecked === restPlayers.length) {
                            openBoardCards        = 1;
                            howManyPlayersChecked = 0;
                        }
    
                        playerId                 = restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) !== -1 ? restPlayers.findIndex(elem => elem.seq > currentPlayer.seq) : 0;
                        player                   = restPlayers[playerId];
                        player.nextPlayer        = 1;
                        currentPlayer.nextPlayer = 0;
                        currentPlayer.changedPot = 0;
                        possibleWinners          = players.filter(elem => elem.isActive);
                    }
                }
    
                return {
                    ...state,
                    players: players,
                    openBoardCards: openBoardCards,
                    openAllBoardCards: openAllBoardCards,
                    alreadyOpenedCards: alreadyOpenedCards,
                    canUpdateTablePot: canUpdateTablePot,
                    possibleWinners: possibleWinners,
                    howManyPlayersChecked: howManyPlayersChecked
                }
    
            case actionTypes.RESET_OPEN_CARDS_FLAGS:
                return {
                    ...state,
                    openBoardCards: 0,
                    openAllBoardCards: 0
                }
    
            case actionTypes.NONE_NEXT_PLAYER:
                let tmpPlayers = [...state.players];
                players        = tmpPlayers.map(elem => ({...elem, nextPlayer: 0}));
    
                return {
                    ...state,
                    players: players
                }
    }

    return state;
}

export default tableReducer;

