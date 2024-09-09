"use client";

import React, { createContext, useState, useContext } from "react";
import { useClient } from "./ClientProvider";
import { parseAbiItem } from "viem";

interface ActivityContextProps {
  activities: any;
  getActivities: () => Promise<any>;
}

const ActivityContext = createContext<ActivityContextProps | undefined>(
  undefined
);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, client } = useClient();
  const [activities, setActivities] = useState();

  const getActivities = async () => {
    if (!client || !account) {
      return;
    }

    // get all mint events
    const logs = await client.getLogs({
      address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      event: parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256)"
      ),
      args: {
        from: "0x",
        // to: '0xa5cc3c03994db5b0d9a5eedd10cabab0813678ac'
      },
      // fromBlock: 16330000n,
      // toBlock: 16330050n
    });

    console.log("logs", JSON.stringify(logs, null, 4));
    return logs;
    // setActivities(logs);
  };

  return (
    <ActivityContext.Provider
      value={{
        activities,
        getActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity: () => ActivityContextProps = () => {
  const context = useContext(ActivityContext);

  if (context === undefined) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
};
