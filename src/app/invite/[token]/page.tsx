'use client'
import { toast } from '@/components/ui/toast'
import { checkInvitationTokenAPI } from '@/services/opreations/emailInvitation'
import { ApiResponse } from '@/types/ApiResponce'
import { AxiosError } from 'axios'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const InvitationPage = () => {
    const params = useParams<{ token: string }>()
    const router = useRouter()
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tokenCheck = async () => {
            try {
                const checkInvitationToken = await checkInvitationTokenAPI().action(params.token)
                const { token, email, isUserExist } = checkInvitationToken?.data?.data
                if (isUserExist) {
                    router.push(`/authentication/sign-in?token=${token}&email=${email}`)
                }
                else {
                    router.push(`/authentication/sign-up?token=${token}&email=${email}`)
                }
            } catch (error) {
                console.error("invitation Error", error);
                const axiosError = error as AxiosError<ApiResponse>;
                const errorMsg = axiosError.response?.data.message;
                toast.add({
                    title: "invitation failed",
                    description: errorMsg,
                });
                setLoading(false);
            } finally {
                setLoading(false);
            }

        }
        tokenCheck()
    }, [params.token, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
        );
    }
    return null;
}

export default InvitationPage