import {UnoCardItem, UnoCardType, UnoColorType} from "@board-games/core";
import {ReactComponent as CardSkip} from "../../../icons/uno/card-skip.svg";
import {ReactComponent as CardReverse} from "../../../icons/uno/card-reverse.svg";
import {ReactComponent as Card1} from "../../../icons/uno/card-1.svg";
import {ReactComponent as Card2} from "../../../icons/uno/card-2.svg";
import {ReactComponent as Card3} from "../../../icons/uno/card-3.svg";
import {ReactComponent as Card4} from "../../../icons/uno/card-4.svg";
import {ReactComponent as Card5} from "../../../icons/uno/card-5.svg";
import {ReactComponent as Card6} from "../../../icons/uno/card-6.svg";
import {ReactComponent as Card7} from "../../../icons/uno/card-7.svg";
import {ReactComponent as Card8} from "../../../icons/uno/card-8.svg";
import {ReactComponent as Card9} from "../../../icons/uno/card-9.svg";
import "./UnoCard.scss";

const getColorName = (color: UnoColorType) => {
  switch (color) {
    case UnoColorType.BLACK:
      return "black";
    case UnoColorType.GREEN:
      return "green";
    case UnoColorType.RED:
      return "red";
    case UnoColorType.BLUE:
      return "blue";
    case UnoColorType.YELLOW:
      return "yellow";
  }
};

export const UnoCardCore = ({type, color}: { type: UnoCardType, color: UnoColorType }) => {
  const fill = `var(--uno-${getColorName(color)})`;
  return <>
    {type === UnoCardType.N_1 && <Card1 color={fill}/>}
    {type === UnoCardType.N_2 && <Card2 color={fill}/>}
    {type === UnoCardType.N_3 && <Card3 color={fill}/>}
    {type === UnoCardType.N_4 && <Card4 color={fill}/>}
    {type === UnoCardType.N_5 && <Card5 color={fill}/>}
    {type === UnoCardType.N_6 && <Card6 color={fill}/>}
    {type === UnoCardType.N_7 && <Card7 color={fill}/>}
    {type === UnoCardType.N_8 && <Card8 color={fill}/>}
    {type === UnoCardType.N_9 && <Card9 color={fill}/>}

    {type === UnoCardType.SKIP && <CardSkip color={fill}/>}
    {type === UnoCardType.REVERSE && <CardReverse color={fill}/>}
    {type === UnoCardType.DRAW && <CardReverse color={fill}/>}

    {type === UnoCardType.DRAW_PICK && <CardReverse color={fill}/>}
    {type === UnoCardType.PICK && <CardReverse color={fill}/>}
  </>;
};

export default ({card}: { card: UnoCardItem, handleClick?: () => void }) => {
  return (
    <div className={"UnoCard"}>
      <UnoCardCore type={card.type} color={card.color}/>
    </div>
  );
}

