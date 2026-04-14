import { HttpException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { UserEntity } from '../../entities/user.entity'
import { hashPassword, verifyPassword } from './password'

type SafeUser = Omit<UserEntity, 'password'>

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async validateUser(username: string, pass: string): Promise<UserEntity | null> {
        const user = await this.userRepository.findOne({
            where: { username },
        })
        if (!user) {
            return null
        }

        const ok = await verifyPassword(pass, user.password)
        return ok ? user : null
    }

    async register(body: Pick<UserEntity, 'username' | 'password'>): Promise<SafeUser> {
        const userIsExist = await this.userRepository.findOne({
            where: { username: body.username },
        })
        if (userIsExist) {
            throw new HttpException({ message: '用户已存在', error: 'user is existed' }, 400)
        }

        const password = await hashPassword(body.password)
        const user = this.userRepository.create({
            ...body,
            password,
        })
        const saved = await this.userRepository.save(user)

        const result = { ...saved }
        delete result.password
        return result
    }

    async findById(id: number): Promise<UserEntity | null> {
        return this.userRepository.findOne({ where: { id } })
    }

    async listUsers(currentUserId: number) {
        const rows = await this.userRepository.find({
            order: { id: 'ASC' },
            take: 200,
        })
        return rows.map(row => ({
            id: row.id,
            username: row.username,
            isCurrent: row.id === currentUserId,
        }))
    }
}
