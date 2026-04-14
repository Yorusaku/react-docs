import { Button } from '@miaoma-doc/shadcn-shared-ui/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@miaoma-doc/shadcn-shared-ui/components/ui/form'
import { Input } from '@miaoma-doc/shadcn-shared-ui/components/ui/input'
import { useToast } from '@miaoma-doc/shadcn-shared-ui/hooks/use-toast'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import * as srv from '@/services'
import { CreateUserPayload } from '@/types/api'

import { TaiJi } from './TaiJi'
import { World } from './World'

export function Login() {
    const form = useForm<CreateUserPayload>({
        defaultValues: {
            username: '',
            password: '',
        },
    })
    const [inputType, setInputType] = useState<'login' | 'register'>('login')
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (values: CreateUserPayload) => {
        const payload = {
            username: values.username.trim(),
            password: values.password,
        }

        try {
            const res = await srv[inputType](payload)

            if (!res.data) {
                toast({
                    variant: 'destructive',
                    title: 'Please retry later',
                })
                return
            }

            if (inputType === 'login') {
                toast({
                    variant: 'success',
                    title: 'Login success',
                })

                localStorage.setItem('token', res.data.access_token)

                const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/doc'
                navigate(redirectUrl)
            }

            if (inputType === 'register') {
                toast({
                    title: 'Registration success, please login',
                })
                setInputType('login')
                form.reset({
                    username: payload.username,
                    password: '',
                })
            }
        } catch {
            toast({
                variant: 'destructive',
                title: inputType === 'login' ? 'Login failed, please retry' : 'Registration failed, please retry',
            })
        }
    }

    return (
        <div className="relative min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            <div className="relative hidden lg:flex h-full flex-col bg-muted p-10 text-white dark:border-r">
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <svg
                        xmlns="http:www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Miaoma Academy
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-4xl mb-8">“Knowledge compounds when shared.”</p>
                        <footer className="text-sm">@Heyi</footer>
                    </blockquote>
                </div>
            </div>

            <div className="hidden lg:block">
                <TaiJi />
                <World yi="yin" />
                <World yi="yang" />
            </div>

            <div className="relative flex items-center justify-center p-6 lg:p-8">
                <div className="mx-auto grid w-full max-w-[360px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold mb-8">Miaoma Collaborative Docs</h1>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField
                                control={form.control}
                                rules={{ required: 'Username is required' }}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter username" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                rules={{ required: 'Password is required' }}
                                render={({ field }) => (
                                    <FormItem className="mt-2">
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" placeholder="Enter password" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full mt-4">
                                {inputType === 'login' ? 'Login' : 'Register'}
                            </Button>
                        </form>
                    </Form>
                    {inputType === 'login' ? (
                        <div className="text-center text-sm">
                            No account?
                            <Button
                                variant="link"
                                onClick={() => {
                                    form.clearErrors()
                                    setInputType('register')
                                }}
                            >
                                Register
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center text-sm">
                            Already have an account?
                            <Button
                                variant="link"
                                onClick={() => {
                                    form.clearErrors()
                                    setInputType('login')
                                }}
                            >
                                Login
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
