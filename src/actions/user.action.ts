"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser(){
    try {
        const {userId}= await auth()
        const user = await currentUser()
        if(!userId || !user)return;
        const existingUser = await prisma.user.findUnique({
            where:{
                clerkid:userId,
            }
        })

        if (existingUser) return existingUser;


        const dbUser = await prisma.user.create({
            data:{
                clerkid: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl

            }
        })
        return dbUser;
    } catch (error) {
        console.log("Error in syncUser",error)
    }
}
export async function getUserByClerkId(ClerkId: string){
    return prisma.user.findUnique({
        where:{
            clerkid: ClerkId,
        },
        include:{
            _count:{
                select:{
                    followers:true,
                    following:true,
                    posts:true,
                }
            }
        }
    }
    )
}