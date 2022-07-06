import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  [OptionalProps]?: 'createdAt' | 'updatedAt'

  @Field(() => Int)
  @PrimaryKey()
  _id!: number;

  @Field(() => String)
  @Property({ type: 'date'})
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ type: 'date',  onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Field()
  @Property({ type: "text", unique: true })
  username!: string;

  /* Notice @Field() is not used here,
     password property can't be queried.
  */
  @Property({ type: "text" })
  password!: string;
}