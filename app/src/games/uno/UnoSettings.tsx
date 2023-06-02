import React from "react";
import {UnoSettings} from "@board-games/core";
import {SettingsGroup, SettingSlider, SettingSwitch} from "../../lobby/LobbyScreen";

export default ({permissions, settings, setSettings}: { permissions: boolean, settings: UnoSettings, setSettings: (settings: UnoSettings) => void }) => (
  <>
    <SettingsGroup label={"Start Amount"}>
      <SettingSlider permissions={permissions} min={1} max={25} defaultValue={settings.cards}
                     updateValue={value => setSettings({...settings, cards: value})}/>
    </SettingsGroup>
    <SettingsGroup label={"Stacking"}>
      <SettingSwitch permissions={permissions} values={{2: "+2 on +4", 1: "+2/+4 separate", 0: "Off"}} defaultValue={settings.stacking}
                     updateValue={value => setSettings({...settings, stacking: value})}/>
    </SettingsGroup>
    <SettingsGroup label={"Lay Duplicates"}>
      <SettingSwitch permissions={permissions} values={{1: "On", 0: "Off"}} defaultValue={settings.duplicates}
                     updateValue={value => setSettings({...settings, duplicates: value})}/>
    </SettingsGroup>
  </>
)