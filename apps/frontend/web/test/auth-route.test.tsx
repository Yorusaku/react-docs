// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import AuthRoute from '@/router/AuthRoute'

describe('AuthRoute', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    function renderWithRouter(initialPath = '/doc/123') {
        Object.defineProperty(window, 'location', {
            value: { pathname: initialPath },
            writable: true,
        })

        return render(
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route
                        path="/doc/:id"
                        element={
                            <AuthRoute>
                                <div data-testid="protected-content">Protected</div>
                            </AuthRoute>
                        }
                    />
                    <Route path="*" element={<div data-testid="login-page">Login</div>} />
                </Routes>
            </MemoryRouter>
        )
    }

    it('should render children when token exists', () => {
        localStorage.setItem('token', 'valid-token')

        renderWithRouter()

        expect(screen.getByTestId('protected-content')).toBeTruthy()
    })

    it('should redirect when no token', () => {
        renderWithRouter()

        // AuthRoute uses relative Navigate to="account/login?..."
        // which matches the catch-all * route
        expect(screen.getByTestId('login-page')).toBeTruthy()
    })
})
