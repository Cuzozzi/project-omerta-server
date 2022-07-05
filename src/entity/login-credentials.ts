import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class login_credentials {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  admin: boolean;
}
