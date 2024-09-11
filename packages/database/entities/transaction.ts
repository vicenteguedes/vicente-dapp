import { Column, Entity } from "typeorm";
import { IDTimeStampEntity } from "./base";

export enum EventName {
  APPROVAL = "Approval",
  TRANSFER = "Transfer",
}

export interface Args {
  owner?: string;
  spender?: string;
  amount?: string;
  from?: string;
  to?: string;
}

@Entity()
export class Transaction extends IDTimeStampEntity {
  @Column()
  symbol: string;

  @Column()
  transactionHash: string;

  @Column()
  blockNumber: number;

  @Column()
  eventName: string;

  @Column({ type: "jsonb", nullable: true })
  args: Args;
}
