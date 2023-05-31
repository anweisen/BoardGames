import React from "react";
import {UnoSettings} from "@board-games/core";
import {SettingsGroup, SettingSlider, SettingSwitch} from "../../lobby/LobbyScreen";

export default ({permissions, settings, setSettings}: { permissions: boolean, settings: UnoSettings, setSettings: (settings: UnoSettings) => void }) => (
  <>
    <SettingsGroup label={"Start Amount"}>
      <SettingSlider permissions={permissions} min={1} max={25} defaultValue={settings.cards}
                     updateValue={value => setSettings({...settings, cards: value})}/>
    </SettingsGroup>
    {/*<SettingsGroup label={"Stacking"}>*/}
    {/*  <SettingSwitch permissions={permissions} values={["On", "Off"]} defaultValue={settings.stacking}*/}
    {/*                 updateValue={value => setSettings({...settings, stacking: value})}/>*/}
    {/*</SettingsGroup>*/}
  </>
)