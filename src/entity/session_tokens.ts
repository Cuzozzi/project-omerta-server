import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class session_tokens {
  @Column()
  user_id: number;

  @Column({ nullable: true })
  token: string;

  @PrimaryGeneratedColumn("increment", { type: "bigint" })
  id: number;

  @Column({ type: "timestamp", nullable: true })
  expiry: Date;
}
