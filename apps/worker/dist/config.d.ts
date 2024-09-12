import convict from "convict";
export declare const config: convict.Config<{
    database: {
        port: number;
        host: string;
        username: string;
        password: string;
        name: string;
    };
    schedule: {
        synchronizeTransactions: string;
    };
}>;
//# sourceMappingURL=config.d.ts.map