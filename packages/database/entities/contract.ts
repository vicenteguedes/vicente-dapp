import { Column, Entity, OneToMany, Unique } from "typeorm";
import { IDTimeStampEntity } from "./base";
import { Transaction } from "./transaction";

@Entity()
@Unique(["address", "networkId"])
export class Contract extends IDTimeStampEntity {
  @Column()
  address: string;

  @Column()
  networkId: number;

  @Column()
  name: string;

  @Column({ default: true })
  isTestNet: boolean;

  @Column({ default: false })
  isSyncing: boolean;

  @Column({ default: false })
  isSynced: boolean;

  @OneToMany(() => Transaction, (transaction) => transaction.contract)
  transactions: Transaction[];
}
