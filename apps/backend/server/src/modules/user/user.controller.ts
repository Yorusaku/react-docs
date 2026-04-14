/*
 *   Copyright (c) 2024 妙码学院 @Heyi
 *   All rights reserved.
 *   妙码学院官方出品，作者 @Heyi，供学员学习使用，可用作练习，可用作美化简历，不可开源。
 */
import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { UserService } from './user.service'

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('register')
    async add(@Body() body) {
        const newUser = await this.userService.register(body)
        return { data: newUser, success: true }
    }

    @Get('list')
    @UseGuards(AuthGuard('jwt'))
    async list(@Request() req: { user: { id: number } }) {
        const users = await this.userService.listUsers(req.user.id)
        return { data: users, success: true }
    }
}
