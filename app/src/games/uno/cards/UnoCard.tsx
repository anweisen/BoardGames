import {UnoCardItem, UnoCardType, UnoColorType} from "@board-games/core";
import {ReactComponent as CardSkip} from "../../../icons/uno/card-skip.svg";
import {ReactComponent as CardReverse} from "../../../icons/uno/card-reverse.svg";
import {ReactComponent as Card1} from "../../../icons/uno/card-1.svg";
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
  const brush = `var(--uno-${getColorName(color)})`
  return <>
    {type ===UnoCardType.N_1 && <Card1 color={brush}/>}
    {type ===UnoCardType.SKIP && <CardSkip color={brush}/>}
    {type ===UnoCardType.REVERSE && <CardReverse color={brush}/>}
    {/*<p style={{fontSize: 30, position: "absolute", color: "aqua"}}>{UnoCardType[type]}</p>*/}
  </>;
};

export default ({card}: { card: UnoCardItem, handleClick?: () => void }) => {
  return (
    <div className={"UnoCard"}>
      <UnoCardCore type={card.type} color={card.color}/>
    </div>
  );
}

