import {ReactComponent as CardSkip} from "../../../icons/uno/card-skip.svg";
import {UnoCardItem, UnoColorType} from "../../../api/models";
import "./UnoCard.scss";

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
  return (
    <div className={"UnoCard"} style={{"color": `var(--uno-${getColorName(card.color)})`}} onClick={handleClick}>
      <CardSkip/>
    </div>
  )
}