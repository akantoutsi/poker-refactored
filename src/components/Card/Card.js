import React       from 'react';

import './Card.css';

const Card = props => {
    let cardClass = ['card'];

    cardClass.push('rank-' + props.value.toLowerCase());
    cardClass.push(props.suit);

    let cardUnicode = (props.suit === 'spades') ? 'U+2660' : 
                      (props.suit === 'clubs')  ? 'U+2663' : 
                      (props.suit === 'hearts') ? 'U+2665' : 'U+2666';

    if (!props.openedCards) {
        return (
            <div className='card back'>*</div>
        );

    } else {
        let tmp = cardUnicode.split('+');

        if (!props.selected) {
            return (
                <div className={cardClass.join(' ')}>
                    <span className='rank'>{props.value}</span>
                    <span className='suit'>{String.fromCharCode(`0x${tmp[tmp.length-1]}`)}</span>
                </div>
            );
        
        } else {
            return (
                <strong>
                    <span className={`card rank-${props.value.toLowerCase()} ${props.suit}`}>    
                        <span className='rank'>{props.value}</span>
                        <span className='suit'>{String.fromCharCode(`0x${tmp[tmp.length-1]}`)}</span>
                    </span>
                </strong>
            );
        } 
    }
}

export default Card;
