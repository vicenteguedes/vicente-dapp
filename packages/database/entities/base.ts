import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export abstract class TimeStampEntity extends BaseEntity {
  @CreateDateColumn({ type: "timestamp", precision: 6 })
  createdAt: Date;
}

export abstract class IDTimeStampEntity extends TimeStampEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
}
