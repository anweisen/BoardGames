import {UnoCardItem, UnoColorType} from "@board-games/core";
import {ReactComponent as CardSkip} from "../../../icons/uno/card-skip.svg";
import "./UnoCard.scss";
import {useState} from "react";

const getColorName = (color: UnoColorType) => {
  switch (color) {
    case UnoColorType.BLACK: return "black";
    case UnoColorType.GREEN: return "green";
    case UnoColorType.RED: return "red";
    case UnoColorType.BLUE: return "blue";
    case UnoColorType.YELLOW: return "yellow";
  }
}

export default ({card, handleClick}: { card: UnoCardItem, handleClick?: () => void }) => {
  const [state, setState] = useState(false);
  return (
    <div className={"UnoCard" + (state ? " Touch" : "")} style={{"color": `var(--uno-${getColorName(card.color)})`}} onClick={handleClick}
         onTouchStartCapture={event => setState(true)}
         // onTouchMove={event => setState(true)}
    >
      <CardSkip/>
    </div>
  )
}

