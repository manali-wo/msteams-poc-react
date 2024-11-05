import { useContext, useState } from "react";
import { Image, TabList, Tab } from "@fluentui/react-components";
import "./Welcome.css";
import { EditCode } from "./EditCode";
import { AzureFunctions } from "./AzureFunctions";
import { CurrentUser } from "./CurrentUser";
import { useData } from "@microsoft/teamsfx-react";
import { Deploy } from "./Deploy";
import { Publish } from "./Publish";
import { TeamsFxContext } from "../Context";
import * as microsoftTeams from "@microsoft/teams-js";

export function Welcome(props) {
  const { showFunction, environment } = {
    showFunction: true,
    environment: window.location.hostname === "localhost" ? "local" : "azure",
    ...props,
  };
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const { teamsUserCredential } = useContext(TeamsFxContext);
  console.log({ teamsUserCredential });
  const { loading, data, error } = useData(async () => {
    console.log("teamsUserCredential found");
    if (teamsUserCredential) {
      console.log("getting userInfo");
      const userInfo = await teamsUserCredential.getUserInfo();
      console.log("userInfo", userInfo);
      return userInfo;
    }
  });
  console.log({ loading, data, error });
  const userName = loading || error ? "" : data.displayName;
  console.log("userName", userName);
  const hubName = useData(async () => {
    console.log("initialize app", microsoftTeams.app);
    await microsoftTeams.app.initialize();
    const context = await microsoftTeams.app.getContext();
    microsoftTeams.pages.config.setValidityState(true);
    microsoftTeams.pages.config.registerOnSaveHandler(function (saveEvent) {
      console.log("Saved", saveEvent);
      microsoftTeams.settings.setSettings({
        entityId: "99f319f1-6d5a-4875-b157-4d730ea6f16b",
        contentUrl: "https://msteams-poc-react.onrender.com", // URL of your app content
        suggestedDisplayName: "My Custom App",
        websiteUrl: "https://msteams-poc-react.onrender.com", // Optional: website URL
      });

      // Call saveEvent.notifySuccess() if saving was successful
      saveEvent.notifySuccess();
    });
    console.log("context", context);
    return context.app.host.name;
  })?.data;
  console.log("hubName", hubName);
  const [selectedValue, setSelectedValue] = useState("local");

  const onTabSelect = (event, data) => {
    setSelectedValue(data.value);
  };
  return (
    <div className="welcome page">
      <div className="narrow page-padding">
        <Image src="hello.png" />
        <h1 className="center">
          Congratulations 1 {userName ? ", " + userName : ""}!
        </h1>
        <p className="center">
          Your app is running in your {friendlyEnvironmentName}
        </p>
        {hubName && <p className="center">Your app is running in {hubName}</p>}

        <div className="tabList">
          <TabList selectedValue={selectedValue} onTabSelect={onTabSelect}>
            <Tab id="Local" value="local">
              1. Build your app locally
            </Tab>
            <Tab id="Azure" value="azure">
              2. Provision and Deploy to the Cloud
            </Tab>
            <Tab id="Publish" value="publish">
              3. Publish to Teams
            </Tab>
          </TabList>
          <div>
            {selectedValue === "local" && (
              <div>
                <EditCode showFunction={showFunction} />
                <CurrentUser userName={userName} />
                {showFunction && <AzureFunctions />}
              </div>
            )}
            {selectedValue === "azure" && (
              <div>
                <Deploy />
              </div>
            )}
            {selectedValue === "publish" && (
              <div>
                <Publish />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
