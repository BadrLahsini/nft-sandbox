import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as needle from 'needle';


const token = process.env.BEARER_TOKEN;


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
  ) {}
  public readonly API_URL = 'https://api.twitter.com/2';


  async createUser(name: string) : Promise<any>{
    const user =  await this.usersModel.findOne({'username': name}).exec();
    if (user != null)
    {
      return user;
    } 
    else 
    {
      const endpointURL = `${this.API_URL}/users/by/username/${name}`;
      const params = {
        'user.fields': 'description,public_metrics', 
      };
      const res = await needle('get', endpointURL, params, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.body) {
        try 
        {
          const result =  await this.usersModel.create(res.body.data);
          return result;
        } catch (err) 
        {
          console.log(err);
          return null;
        }
        
    } else {
        return null
    }
      
    } 
  }
  async createFollowings(name: string) : Promise<any> {
    let users = [];
    const user : User = await this.createUser(name);
    const userId = user.id;
    const url = `${this.API_URL}/users/${userId}/following`;
    const params = {
      "max_results":1000,
      'user.fields': 'description,public_metrics', 
    };
    const options = {
      headers: {
          "Authorization": `Bearer ${token}`
      }
    }
    let hasNextPage = true;
    let nextToken = null;
    console.log("Retrieving users this user is following...");
    while (hasNextPage) {
        let resp = await this.getPage(params, options, nextToken, url);
        if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
            if (resp.data) {
                users.push.apply(users, resp.data);
            }
            if (resp.meta.next_token) {
                nextToken = resp.meta.next_token;
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    console.log(`Got ${users.length} users.`);

    await Promise.all(users.map(async (item)=> {
      try 
        {
          await this.usersModel.create(item);
        } catch (err) 
        {
          await console.log(err);
        }
  }));

    return user
  }

  async getPage (params, options, nextToken, url) : Promise<any>{
    if (nextToken) {
        params.pagination_token = nextToken;
    }

    try {
        const resp = await needle('get', url, params, options);

        if (resp.statusCode != 200) {
            console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
            return;
        }
        return resp.body;
    } catch (err) {
        throw new Error(`Request failed: ${err}`);
    }
}
  }


