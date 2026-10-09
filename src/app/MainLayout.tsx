'use client'
import BlankLayout from "@/components/layout/blank/BlankLayout"
import FullLayout from "@/components/layout/full/FullLayout"
import { usePathname } from "next/navigation"
import { ThemeProvider } from "@/context/ThemeContext"
import { Toaster } from "@/components/ui/toast"

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    const layoutSelector = () => {
        if (pathname.includes("/tasks")) {
            return <FullLayout>{children}</FullLayout>
        } else {
            return <BlankLayout>{children}</BlankLayout>
        }
    }

    return (
        <html
            lang="en"
            className="h-full antialiased dark"
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider>
                    {layoutSelector()}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    )
}

export default MainLayout