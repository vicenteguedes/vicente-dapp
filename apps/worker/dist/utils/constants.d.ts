import { Address, Chain } from "viem";
export declare const ETH_DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";
export declare const SEPOLIA_TX_BASE_URL = "https://sepolia.etherscan.io/tx/";
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const PAGE_SIZE = 10;
export declare const BATCH_SIZE = 1000;
export declare const EARLIEST_BLOCK = 5680636n;
export interface ChainData {
    chainId: number;
    hexChainId: string;
    multicallAddress: Address;
    name: string;
    tokens: {
        name: string;
        address: Address;
    }[];
    chain: Chain;
}
export declare const SEPOLIA_DATA: ChainData;
export declare const ERC20_ABI: ({
    inputs: never[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
    name?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
//# sourceMappingURL=constants.d.ts.map