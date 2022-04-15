import { Controller, Get, Post, Body, Res, Param, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get()
  async findAll() {
    return await this.userService.createUser('jlindsayfilm');
  }

  @Post()
    async createUser(@Res() response, @Body('username') userName: string) {
        const newUser = await this.userService.createUser(userName)
        if (newUser == null) {
          return response.status(HttpStatus.NOT_FOUND).json({
            newUser
          });
      } else {
        return response.status(HttpStatus.CREATED).json({
          newUser
        })
      }
        
    }
    @Post('followings')
    async createFollowings(@Res() response, @Body('username') userName: string) {
        const newUser = await this.userService.createFollowings(userName)
        return response.status(HttpStatus.CREATED).json({
          newUser
        })
        
    }

}
