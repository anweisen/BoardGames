import {UnoCardItem, UnoCardType, UnoColorType} from "@board-games/core";
import {ReactComponent as CardSkip} from "../../../icons/uno/card-skip.svg";
import "./UnoCard.scss";

const getColorName = (color: UnoColorType) => {
  switch (color) {
    case UnoColorType.BLACK:return "black";
    case UnoColorType.GREEN:return "green";
    case UnoColorType.RED:return "red";
    case UnoColorType.BLUE:return "blue";
    case UnoColorType.YELLOW:return "yellow";
  }
};

export const UnoCardCore = ({type, color}: { type: UnoCardType, color: UnoColorType }) => {
  return <>
    <CardSkip color={`var(--uno-${getColorName(color)})`}/>
    <p style={{fontSize: 30, position: "absolute", color: "aqua"}}>{UnoCardType[type]}</p>
  </>;
};

export default ({card}: { card: UnoCardItem, handleClick?: () => void }) => {
  return (
    <div className={"UnoCard"}>
      <UnoCardCore type={card.type} color={card.color}/>
    </div>
  );
}

