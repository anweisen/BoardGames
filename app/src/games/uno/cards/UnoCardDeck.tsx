import {ReactComponent as CardSvg} from "../../../icons/uno/card-uno.svg";
import "./UnoCardDeck.scss"

export default () => {
  return (
    <div className={"UnoCardDeck"}>
      <CardSvg className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
      <div className={"Card"}/>
    </div>
  )
}