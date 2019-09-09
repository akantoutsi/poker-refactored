import _ from 'lodash';

export const groupByProperty = (ourArray, property) => {
    return ourArray.reduce(function (accumulator, object) {
        const key = object[property];

        if (!accumulator[key]) {
            accumulator[key] = [];
        }

        accumulator[key].push(object);

        return accumulator;
    }, {});
}

export const sortArray = (arr, property) => {
    const res = arr.sort((a, b) => a.rank < b.rank ? 1 : -1);
  
    return res;
}

export const formatCards = (cardsToFormat) => {
    let cards                  = sortArray(cardsToFormat, 'rank');  
    let grpCardsBySuit         = groupByProperty(cards, 'suit');
    let tmpGroupedCardsByValue = groupByProperty(cards, 'rank');

    for (let elem in tmpGroupedCardsByValue) { 
        tmpGroupedCardsByValue[elem].freq = tmpGroupedCardsByValue[elem].length; 
    }

    let grpCardsByValue = Object.entries(tmpGroupedCardsByValue);
    sortArray(grpCardsByValue, grpCardsByValue[1]);

    let a        = findWinner(grpCardsBySuit, grpCardsByValue);
    let winCombs = [];
    winCombs.push(a);

    return winCombs;
}

export const printWinners = (arr) => {
    let grouped = arr.map(elem => {
        return elem.reduce((acc, el) => {
            const key = el.typeOfCombination;
        
            if (!acc[key]) {
                acc[key] = [];
            }
    
            acc[key].push(el);
    
            return acc;
        }, {});
    });
      
    let groupedArr = grouped.map(elem => Object.entries(elem));
    groupedArr.map(elem => elem[0][0] = parseInt(elem[0][0]));
    
    let sortedGroupedArr   = groupedArr.reduce((acc, el) => { acc[0] = (acc[0] === undefined || el[0][0] < acc[0]) ? el[0][0] : acc[0]; return acc; }, []);
    let groupedArrFiltered = groupedArr.filter(elem => elem[0].includes(sortedGroupedArr[0]));
    let res                = groupedArrFiltered.map(elem => elem[0][1]);

    return res;
}

export const getWinnerIds = (arr) => {
    return arr.map(elem => {
        return elem.reduce((acc, el) => { 
            acc = (el.belongsTo !== 'board') ? parseInt(el.belongsTo) : 'board';  
            return acc; 
        }, -1);
    });
}     

export const createCards = () => {
    let suits     = ['hearts', 'clubs', 'spades', 'diams'];
    let values    = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    let tmpSuits  = [...suits];
    let tmpValues = [...values];

    var res = tmpSuits.reduce((acc, s) =>
        acc.concat(tmpValues.map(v => ({'suit': s, 'value': v}))), []
    );

    return res;
}

export const updateObjectInArray = (array, obj) => {
    return array.map((item, index) => {
        if (index !== obj.index) {
            return item;
        }
    
        return {
            ...item,
            ...obj.item
        }
    })
}

export const findMaxPot = (arr, property) => {
    return arr.reduce((max, elem) => {
        max = (elem[property] > max) ? elem[property] : max;   
        return max;
    }, 0);
}

export const checkIfAll = (arr, property, value) => {
    return arr.reduce((acc, elem) => {
        acc += (elem[property] === value) ? 1 : 0;
        return acc;
    }, 0);
}

export const cardsToOpen = (arr, property, openAllFlag) => {
    const cardsClosed   = checkIfAll(arr, property, false);
    let   howManyToOpen = 0;
    let   fromIndex     = 0;
    let   slicedArr     = [];
    let   retArr        = [];

    if (!openAllFlag) {
        switch (cardsClosed) {
            case arr.length:
                howManyToOpen = 3;
                fromIndex     = 0;
                break;

            case 2:
                howManyToOpen = 1;
                fromIndex     = 3;  
                break;

            case 1:
                howManyToOpen = 1;
                fromIndex     = 4;
                break;

            default:
                howManyToOpen = 0;
                break;
        }

        if (howManyToOpen > 0) {
            slicedArr = arr.slice(fromIndex, fromIndex + howManyToOpen);
            retArr    = slicedArr.map(e => ({...e, isVisible: true}));
        
            if (howManyToOpen === 3) {
                const [first, second, third] = retArr; 
                arr.splice(fromIndex, howManyToOpen, first, second, third);
        
            } else {
                const [first] = retArr; 
                arr.splice(fromIndex, howManyToOpen, first);
            }
        }

    } else {
        howManyToOpen = arr.length;
        fromIndex     = 0;

        slicedArr = arr.slice();
        retArr    = slicedArr.map(e => ({...e, isVisible: true}));

        const [first, second, third, fourth, fifth] = retArr;
        arr.splice(fromIndex, howManyToOpen, first, second, third, fourth, fifth); 
    }

    return arr;
}

const sameCardExistsNtimes = (arr, freq) => {
    let res = arr.find(e => e[1].freq === freq);
    return (res) ? res : [];
}

const containsStraight = (arr) => {
    let res       = [];
    let firstElem = arr[0];

    res.push(firstElem);

    for (let i=0; i<=arr.length-1; i++) { 
        if (res.length < 5) {
            if (parseInt(firstElem.rank) === parseInt(arr[i].rank) + 1) { 
                res.push(arr[i]); 
                firstElem = arr[i];
            
            } else { 
                res       = [];               
                firstElem = arr[i];
                res.push(firstElem);
            } 
        }
    }
    return res;
}

const findCombination = (groupedCardsBySuit, groupedCardsByValue) => { 
    let winCombination    = [];
    let typeOfCombination = 0;

    // [1, 2] Royal Flush or Straight Flush - OK
    for (let elem in groupedCardsBySuit) {
        let cardToCheck = groupedCardsBySuit[elem];
        let res         = containsStraight(cardToCheck);

        if (res.length === 5) {
            if (res[0].rank === 14) {
                typeOfCombination = 1;

            } else {
                typeOfCombination = 2;
            }

            winCombination = res;
            _.set(winCombination, 'typeOfCombination', typeOfCombination);

            return winCombination;
        }
    }

    // [3] Four of a Kind - OK
    let fours = [];
    fours     = sameCardExistsNtimes(groupedCardsByValue, 4); 

    if (fours.length > 0) {
        typeOfCombination = 3;
        winCombination    = fours[1].slice(0, fours[1].freq);
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    }

    // [4] Full House - OK
    let threes = [];
    threes     = sameCardExistsNtimes(groupedCardsByValue, 3);

    if (threes.length > 0) {
        let copiedGroupedCardsByValue = _.cloneDeep(groupedCardsByValue);

        let index  = copiedGroupedCardsByValue.indexOf(threes);
        copiedGroupedCardsByValue.splice(index, 1);
        let twos = copiedGroupedCardsByValue.find(e => e[1].freq >= 2);

        if (twos) {
            typeOfCombination = 4;
            winCombination    = threes[1].slice(0, threes[1].freq).concat(twos[1].slice(0, twos[1].freq));
            _.set(winCombination, 'typeOfCombination', typeOfCombination);

            return winCombination;
        }
    };
    
    // [5] Flush - OK
    for (let elem in groupedCardsBySuit) {
        if (groupedCardsBySuit[elem].length === 5) {
            typeOfCombination = 5;
            winCombination    = groupedCardsBySuit[elem];
            _.set(winCombination, 'typeOfCombination', typeOfCombination);

            return winCombination;
        }
    }

    // [6] Straight - OK
    let newGrp = [];
    for (let elem in groupedCardsByValue) {
        newGrp.push(groupedCardsByValue[elem][1][0]);
    }

    let possibleStraight = containsStraight(newGrp);
    if (possibleStraight.length === 5) {
        typeOfCombination = 6;
        winCombination    = possibleStraight;
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    
    }

    if (possibleStraight.length === 4) {
        let twoExists = (possibleStraight.find(el => el.rank === 2)) ? 1 : 0;

        if (twoExists) {
            let copiedGrpCardsByValue = _.cloneDeep(newGrp);
        
            let aceExists = copiedGrpCardsByValue.reduce((acc, elem) => { 
                acc += (elem.rank === 14) ? 1 : 0; 
                return acc; 
            }, 0);

            if (aceExists === 1) {
                let toCheck = copiedGrpCardsByValue.map(elem => (elem.rank === 14) ? {...elem, rank: 1} : elem);

                toCheck.splice(toCheck.length - 1, 1, toCheck.splice(0, 1)[0]);
                possibleStraight = containsStraight(toCheck);

                typeOfCombination = 6;
                winCombination    = possibleStraight;
                _.set(winCombination, 'typeOfCombination', typeOfCombination);

                return winCombination;
            }
        }
    }

    // [7] Three of a Kind - OK
    let threeOfKind = [];
    threeOfKind     = sameCardExistsNtimes(groupedCardsByValue, 3);

    if (threeOfKind.length > 0) {
        typeOfCombination = 7;
        winCombination    = threeOfKind[1].slice(0, threeOfKind.freq);
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    }

    // [8] Two Pairs - OK
    let twos = [];
    twos     = groupedCardsByValue.filter(e => e[1].freq === 2);

    if (twos.length >= 2) {
        typeOfCombination = 8;
        winCombination    = twos[0][1].concat(twos[1][1]);
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    }

    // [9] Pair - OK
    if (twos.length === 1) {
        typeOfCombination = 9;
        winCombination    = twos[0][1].slice(0, twos[0][1].freq);
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    } 

    // [10] High Card - OK
    if (winCombination) {
        typeOfCombination = 10;
        winCombination    = groupedCardsByValue[0][1].slice(0, groupedCardsByValue[0][1].freq);
        _.set(winCombination, 'typeOfCombination', typeOfCombination);

        return winCombination;
    }
}

export const findWinner = (bySuit, byValues) => {
    let res = findCombination(bySuit, byValues);
    let acceptedCombinations = [];
    acceptedCombinations.push(res);

    return acceptedCombinations;
}