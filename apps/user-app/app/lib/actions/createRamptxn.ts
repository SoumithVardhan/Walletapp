"use server";

import  prisma from "@repo/db/client";
import {RampType ,RampStatus}   from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { SignJWT } from "jose";
 
import { getBalance } from "./getBalance";


 
export async function createRampTransaction(type: RampType, amount: number) {
    // Ideally the token should come from the banking provider (hdfc/axis)

    const session = await getServerSession(authOptions);
    const balance:any = await getBalance()
    if (!session || !session.user) {
        throw new Error("Unauthorzed")
      }
 
    if((balance.amount-balance.locked)<amount &&type==RampType.OFF_RAMP){
        return {
            success:false,
            token:"",
            message:"You don't have enough funds. $"+ balance.locked/100+ " is locked due to some pending transactions."
        }
    }else{
        const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_NETBANKING_SECRET)
        const token = await new SignJWT({
            amount: amount ,
            type:type,
          }).setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("100m")
            .sign(secret);

            if(type==RampType.OFF_RAMP){
                await prisma.balance.update({
                    where:{userId:Number(session.user?.id)},
                    data:{
                        locked:{
                            increment:Number(amount )
                        }
                    }
                })
            }
            
    
        await prisma.rampTransaction.create({
            data: {
                type:type,
                status: RampStatus.INITIATED,
                startTime: new Date(),
                token: token,
                userId: Number(session?.user?.id),
                amount: amount ,
                balance:balance.amount
            }
        });
    
        return {
            success:true,
            token:token,
            message:" ",
        }
    }

  
}