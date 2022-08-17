import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class login_credentials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  moderator: boolean;

  @Column()
  admin: boolean;

  @Column({ nullable: true })
  tilepower: number;
}
