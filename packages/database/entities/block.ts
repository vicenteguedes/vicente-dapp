import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Transaction } from "./transaction";
import { TimeStampEntity } from "./base";

@Entity()
export class Block extends TimeStampEntity {
  @PrimaryColumn()
  number: number;

  @OneToMany(() => Transaction, (transaction) => transaction.block)
  transactions: Transaction[];

  @Column({ type: "timestamp", precision: 6, nullable: true })
  timestamp: Date;
}
