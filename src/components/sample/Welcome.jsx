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
import { app } from "@microsoft/teams-js";

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
    console.log("initialize app", app);
    await app.initialize();
    const context = await app.getContext();
    console.log("context", context);
    await app.setValidityState(true);
    await app.registerOnSaveHandler((saveEvent) => {
      console.log("Saved");

      // Perform any additional save logic here

      // Signal that the save operation is complete
      saveEvent.notifySuccess();
    });
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
          Congratulations {userName ? ", " + userName : ""}!
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
