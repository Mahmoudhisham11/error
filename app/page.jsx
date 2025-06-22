'use client';
import Login from "@/components/Login/page";
import Main from "@/components/Main/page";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [logedin, setLogedin] = useState(false)

  useEffect(() => {
    if(typeof window !== "undefined") {
      const storageName = localStorage.getItem('userName')
      if(storageName) {
        setLogedin(true)
      }
    }
  }, [])

  return (
   <div className="main">
      {logedin ? <Main/> : <Login/>}
   </div>
  );
}
