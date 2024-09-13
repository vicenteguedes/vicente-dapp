export interface Transaction {
  id: string;
  address: string;
  transactionHash: string;
  blockNumber: number;
  eventName: string;
  from?: string;
  to?: string;
  value?: bigint;
}

export type DailyVolume = {
  day: string;
  value: number;
};
