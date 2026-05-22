export const testUsers = {
    user1: {
        username: 'e2e_test_user_1',
        password: 'Test123456!',
    },
    user2: {
        username: 'e2e_test_user_2',
        password: 'Test123456!',
    },
}

export const generateTestUser = () => {
    const timestamp = Date.now()
    return {
        username: `e2e_user_${timestamp}`,
        password: 'Test123456!',
    }
}
