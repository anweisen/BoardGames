import React, {MutableRefObject, useEffect, useState} from "react";
import {MdLock} from "react-icons/md";
import {InitLobbyPayload, PlayerInfo, SocketMessageType, UnoSettings as UnoSettingsType} from "@board-games/core";
import {Connection} from "../App";
import UnoSettings from "../games/uno/UnoSettings";
import "./LobbyScreen.scss";

export default ({payload, players, playerName, connection, ping, settings, permissions}: {
  payload: InitLobbyPayload,
  players: PlayerInfo[],
  settings: object,
  playerName: string,
  connection: MutableRefObject<Connection>,
  ping: number | undefined,
  permissions: boolean,
}) => {
  return (
    <div className={"LobbyScreen"}>
      <div className={"Panel"}>
        <div className={"Header"}>
          <div className={"Title"}>{payload.lobbyName}<p className={"Ping"}>{ping || 0}ms</p></div>
          <div className={"Button Start" + (!permissions || players.length === 0 ? " Locked" : "")}
               onClick={!permissions ? undefined : _ => connection.current.sendPacket(SocketMessageType.REQUEST_START, {})}>
            {!permissions && <MdLock/>}
            Start Game
          </div>
        </div>
        <div className={"Content"}>
          <div className={"Players"}>
            <div key={payload.playerId} className={"Player"}>{playerName}</div>
            {players.map(player => (
              <div key={player.id} className={"Player"}>{player.name}</div>
            ))}
          </div>
          <div className={"Border"}/>
          <div className={"LobbySettings"}>
            <UnoSettings permissions={permissions} settings={settings as UnoSettingsType}
                         setSettings={value => connection.current.sendPacket(SocketMessageType.UPDATE_SETTINGS, value)}/>
          </div>
        </div>
      </div>
    </div>
  );
}

export const SettingsGroup = ({label, children}: { label: string, children: React.ReactNode }) => {
  return (
    <div className={"SettingsGroup"}>
      <div className={"Label"}>{label}</div>
      {children}
    </div>
  );
};
export const SettingSlider = ({permissions, min, max, defaultValue, updateValue}: {
  permissions: boolean,
  min: number,
  max: number,
  defaultValue: number,
  updateValue: (value: number) => void
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (<>
    {!permissions ? <div className={"Display"}>{defaultValue}</div> : <div className={"SliderGroup"}>
      <input className={"Slider"} type={"range"} min={min} max={max} value={value}
             onChange={event => setValue(event.currentTarget.valueAsNumber)}
             onClick={event => updateValue(event.currentTarget.valueAsNumber)}
             onTouchEnd={event => updateValue(event.currentTarget.valueAsNumber)}/>
      <div className={"CurrentValue"}>{value}</div>
    </div>}
  </>);
};
export const SettingSwitch = ({permissions, values, defaultValue, updateValue}: {
  permissions: boolean,
  values: string[],
  defaultValue: number,
  updateValue: (value: number) => void,
}) => {
  return (<>
    {!permissions ? <div className={"Display"}>{values[defaultValue]}</div> : <div className={"SwitchGroup"}>
      {values.map((value, index) => (
        <div key={index} className={"Switch" + (index === defaultValue ? " Current" : "")} onClick={_ => updateValue(index)}>{value}</div>
      ))}
    </div>}
  </>);
};

