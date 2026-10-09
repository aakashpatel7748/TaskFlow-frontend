"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import {
    User,
    CircleHelp,
    LogOut,
    Camera,
} from "lucide-react";

import { getAppSession, removeAppSession } from "@/lib/session/AppSession";
import { logoutAPI } from "@/services/opreations/auth";

const UserMenu = () => {
    const [appSession, setAppSession] = useState<any>(null);
    const [profileImage, setProfileImage] = useState(
        "/assets/images/user-1.jpg"
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const session = getAppSession();
        setAppSession(session);

    }, []);

    const getInitials = (name?: string) => {
        if (!name) return "";

        const names = name.split(" ");

        return (
            (names[0]?.charAt(0) || "") +
            (names[1]?.charAt(0) || "")
        ).toUpperCase();
    };

    const logoutHandler = async () => {
        try {
            await logoutAPI().action();
        } catch (err) {
            console.log(err);
        }

        removeAppSession();
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = (ev) => {
            setProfileImage(ev.target?.result as string);
        };

        reader.readAsDataURL(file);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger render={
                    <Avatar className="cursor-pointer" >

                        <AvatarImage src="" />
                        <AvatarFallback>AP</AvatarFallback>
                    </Avatar>
                }>
                    <button className="relative cursor-pointer">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={profileImage} />
                            <AvatarFallback>
                                {getInitials(appSession?.fullName)}
                            </AvatarFallback>
                        </Avatar>

                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align="end"
                    className="w-80 rounded-xl p-0 px-4 overflow-hidden mt-4 "
                    style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                    <div className="  p-5 flex flex-col items-center" >

                        <input
                            hidden
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                        />

                        <div
                            className="relative cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <Avatar className="h-15 w-15">
                                <AvatarImage src={profileImage} />
                                <AvatarFallback>
                                    {getInitials(appSession?.fullName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1 text-white">
                                <Camera size={14} />
                            </div>
                        </div>

                        <h3 className="mt-3 font-semibold">
                            {appSession?.fullName}
                        </h3>
                    </div>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem >
                        <Link
                            href="/profile"
                            className="cursor-pointer flex items-center gap-3"
                        >
                            <User size={18} />
                            <div>
                                <p className="font-medium">My Profile</p>
                                <span className="text-xs text-muted-foreground">
                                    Manage your personal information
                                </span>
                            </div>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem >
                        <Link
                            href="/help"
                            className="cursor-pointer flex items-center gap-3"
                        >
                            <CircleHelp size={18} />
                            <div>
                                <p className="font-medium">Help Center</p>
                                <span className="text-xs text-muted-foreground">
                                    Have questions or facing issues?
                                </span>
                            </div>
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <div className="p-3">
                        <Button
                            variant="destructive"
                            className="w-full "
                            onClick={logoutHandler}
                        >
                            <LogOut className=" h-2 w-2" />
                            Log Out
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu >
        </>
    );
};

export default UserMenu;