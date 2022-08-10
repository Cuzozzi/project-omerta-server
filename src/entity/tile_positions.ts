import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class tile_positions {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column({ nullable: true })
  x: number;

  @Column({ nullable: true })
  y: number;

  @Column({ nullable: true })
  z: number;
}
