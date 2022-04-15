import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
class publicMetrics {
  @Prop()
  followers_count: number;
  
  @Prop()
  following_count: number;

  @Prop()
  tweet_count: number;

  @Prop()
  listed_count: number;
}


@Schema({autoIndex: false})
export class User {
  @Prop()
  username: string;

  @Prop()
  description: string;

  @Prop()
  name: string;

  @Prop()
  public_metrics : publicMetrics

  @Prop({
    required: true,
    unique:true,
  })
  id: string;
}

export const UserSchema = SchemaFactory.createForClass(User);