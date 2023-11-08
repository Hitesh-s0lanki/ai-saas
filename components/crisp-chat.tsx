"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

const CrispChat = () => {
    useEffect(() => {
        Crisp.configure("01012e1e-e041-4a61-ae21-2ad0dfa7d071")
    },[])
    
    return null;
}
 
export default CrispChat;