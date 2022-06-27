import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class testUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  secondName: string;
}
