import {BrowserRouter} from "react-router-dom";
import UnoView from "./games/uno/UnoView";

export default () => {
  return (
    <div className={"App"}>
      <BrowserRouter>
        {/*<Routes>*/}
        {/*  <Route>*/}
        <UnoView></UnoView>
        {/*</Route>*/}
        {/*</Routes>*/}
      </BrowserRouter>
    </div>
  );
}
