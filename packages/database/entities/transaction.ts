import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { IDTimeStampEntity } from "./base";
import { Block } from "./block";
import { Contract } from "./contract";

@Entity()
@Unique(["transactionHash", "logIndex"])
export class Transaction extends IDTimeStampEntity {
  @Column()
  contractAddress: string;

  @ManyToOne(() => Contract, (contract) => contract.transactions, { onDelete: "CASCADE" })
  contract: Contract;

  @Column()
  logIndex: number;

  @Column()
  transactionHash: string;

  @Column()
  blockNumber: number;

  @ManyToOne(() => Block, (block) => block.transactions, { onDelete: "SET NULL" })
  block: Block;

  @Column()
  eventName: string;

  @Column({ nullable: true })
  from?: string;

  @Column({ nullable: true })
  to?: string;

  @Column({ nullable: true, type: "numeric" })
  value?: bigint;
}
