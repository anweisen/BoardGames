import {CSSProperties, MutableRefObject, useRef} from "react";
import {UnoCardItem} from "@board-games/core";
import {UnoCardCore} from "./UnoCard";
import "./UnoUsedCards.scss";

export default ({cards}: { cards: UnoCardItem[] }) => {
  const states = useRef<Record<number, CSSProperties>>({});

  return (
    <div className={"UnoUsedCards"}>
      {cards.map((card, index) => (
        <div key={index} className={"UnoCard"} style={properties(states, index)}>
          <UnoCardCore type={card.type} color={card.color}/>
        </div>
      ))}
    </div>
  );
}

const properties = (states: MutableRefObject<Record<number, { }>>, index: number): CSSProperties => {
  console.log(states);
  if (states.current[index]) return states.current[index];
  const props: CSSProperties = {
    // @ts-ignore
    "--rotate": randomRotate() + "deg",
    "--offsetX": randomRotate() + "px",
    "--offsetY": randomRotate() + "px",
  }
  states.current[index] = props;
  return props
};

const randomRotate = () => {
  return Math.random() * 30 - 15;
};