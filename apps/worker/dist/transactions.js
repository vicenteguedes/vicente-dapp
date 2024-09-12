"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.synchronizeTransactions = exports.loadBatchLogs = void 0;
const viem_1 = require("viem");
const constants_1 = require("./utils/constants");
const viem_2 = require("./viem");
const database_1 = require("@repo/database");
const loadBatchLogs = async (latestBlockNumber) => {
    // do not let the block number go below EARLIEST_BLOCK
    const fromBlock = BigInt(Math.max(Number(latestBlockNumber) - constants_1.BATCH_SIZE, Number(constants_1.EARLIEST_BLOCK)));
    const logs = (await viem_2.viemClient.getLogs({
        address: constants_1.SEPOLIA_DATA.tokens[0].address,
        events: (0, viem_1.parseAbi)([
            "event Approval(address indexed owner, address indexed spender, uint256 value)",
            "event Transfer(address indexed from, address indexed to, uint256 value)",
        ]),
        fromBlock,
        toBlock: latestBlockNumber,
    }));
    if (!logs.length) {
        return [];
    }
    return logs;
};
exports.loadBatchLogs = loadBatchLogs;
const synchronizeTransactions = async () => {
    let blockNumber = await viem_2.viemClient.getBlockNumber();
    const { earliestBlock: databaseEarliestBlockNumber } = await database_1.Transaction.getRepository()
        .createQueryBuilder()
        .select("MIN(block_number)", "earliestBlock")
        .getRawOne();
    console.log("databaseEarliestBlockNumber", databaseEarliestBlockNumber);
    if (databaseEarliestBlockNumber && databaseEarliestBlockNumber > constants_1.EARLIEST_BLOCK) {
        console.log("Database is still performing initial sync");
        return;
    }
    const { latestBlock: databaseLatestBlockNumber } = await database_1.Transaction.getRepository()
        .createQueryBuilder()
        .select("MAX(block_number)", "latestBlock")
        .getRawOne();
    const earliestSynchronizedBlockNumber = BigInt(databaseLatestBlockNumber || 0) || constants_1.EARLIEST_BLOCK;
    console.log({ blockNumber, earliestSynchronizedBlockNumber }, "Syncronizing blockchain");
    while (blockNumber > earliestSynchronizedBlockNumber) {
        const logs = await (0, exports.loadBatchLogs)(blockNumber);
        console.log(logs);
        await database_1.Transaction.insert(logs.map((log) => ({
            blockNumber: Number(log.blockNumber),
            transactionHash: log.transactionHash,
            address: log.address,
            eventName: log.eventName,
            from: log.args.from || log.args.owner,
            to: log.args.to || log.args.spender,
            value: (0, viem_1.formatEther)(log.args.value),
            logIndex: log.logIndex,
        })));
        blockNumber = BigInt(Math.max(Number(blockNumber) - constants_1.BATCH_SIZE, Number(constants_1.EARLIEST_BLOCK)));
    }
};
exports.synchronizeTransactions = synchronizeTransactions;
(0, viem_2.initViemClient)();
viem_2.viemClient
    .getLogs({
    address: constants_1.SEPOLIA_DATA.tokens[0].address,
    events: (0, viem_1.parseAbi)([
        "event Approval(address indexed owner, address indexed spender, uint256 value)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
    ]),
    fromBlock: 6642747n,
    toBlock: 6642747n,
})
    .then((logs) => {
    console.log(logs);
});
