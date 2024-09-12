interface TransactionLog {
    address: string;
    args: {
        from?: string;
        to?: string;
        owner?: string;
        spender?: string;
        value: bigint;
    };
    blockHash: string;
    blockNumber: bigint;
    data: string;
    eventName: string;
    logIndex: number;
    removed: boolean;
    topics: string[];
    transactionHash: string;
    transactionIndex: number;
}
export declare const loadBatchLogs: (latestBlockNumber: bigint) => Promise<TransactionLog[]>;
export declare const synchronizeTransactions: () => Promise<void>;
export {};
//# sourceMappingURL=transactions.d.ts.map