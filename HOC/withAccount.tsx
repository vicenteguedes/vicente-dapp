import React from "react";
import { useRouter } from "next/router";
import { useClient } from "@/contexts/ClientProvider";

const withAccount = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => {
    const router = useRouter();
    const { account } = useClient();

    React.useEffect(() => {
      if (router.pathname === "/") {
        return;
      }

      if (!account && router.pathname !== "/") {
        router.replace("/");
      }
    }, [account, router]);

    return account || router.pathname === "/" ? (
      <WrappedComponent {...props} />
    ) : null;
  };
};

export default withAccount;
