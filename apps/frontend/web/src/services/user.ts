/*
 *   Copyright (c) 2024 婵℃瑧鐖滅€涳箓娅?@Heyi
 *   All rights reserved.
 *   婵℃瑧鐖滅€涳箓娅岀€规ɑ鏌熼崙鍝勬惂閿涘奔缍旈敓?@Heyi閿涘奔绶电€涳箑鎲崇€涳缚绡勬担璺ㄦ暏閿涘苯褰查悽銊ょ稊缂佸啩绡勯敍灞藉讲閻劋缍旂紘搴″缁犫偓閸樺棴绱濇稉宥呭讲瀵偓濠ф劧鎷? */

import { CurrentUserRes, LoginPayload, LoginRes, UserListRes } from '@/types/api'
import { request } from '@/utils/request'

/**
 * 閿熺煫浼欐嫹閿熸枻鎷峰綍
 * @param data
 * @returns
 */
export const login = async (data: LoginPayload): Promise<LoginRes> => {
    return await request.post('/auth/login', data)
}

/**
 * 閿熸枻鎷峰彇閿熸枻鎷峰墠閿熺煫浼欐嫹閿熸枻鎷锋伅
 * @returns
 */
export const currentUser = async (): Promise<CurrentUserRes> => {
    return await request.get('/currentUser')
}

/**
 * 閿熺煫浼欐嫹娉ㄩ敓鏂ゆ嫹
 * @param data
 * @returns
 */
export const register = async (data: { username: string; password: string }) => {
    return await request.post('/user/register', data)
}

/**
 * 閿熺煫浼欐嫹閿熷壙绛规嫹閿熸枻鎷峰綍
 * @returns
 */
export const logout = async () => {
    return await request.post('/auth/logout')
}

export const listUsers = async (): Promise<UserListRes> => {
    return await request.get('/user/list')
}
