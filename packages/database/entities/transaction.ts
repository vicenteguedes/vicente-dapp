import { Column, Entity, Unique } from "typeorm";
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
@Unique(["transactionHash", "logIndex"])
export class Transaction extends IDTimeStampEntity {
  @Column()
  address: string;

  @Column()
  logIndex: number;

  @Column()
  transactionHash: string;

  @Column()
  blockNumber: number;

  @Column()
  eventName: string;

  @Column({ nullable: true })
  from?: string;

  @Column({ nullable: true })
  to?: string;

  @Column({ nullable: true, type: "numeric", precision: 36, scale: 18 })
  value?: number;
}
