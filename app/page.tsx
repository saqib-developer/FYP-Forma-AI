import Header from "@/_shared/Header";
import Hero from "@/_shared/Hero";
import Footer from "@/_shared/Footer";
import { Button } from "@/components/ui/button";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";

export default function Home() {
  return (
    <div className="overflow-hidden min-h-screen flex flex-col">
      <Header/>
      <div className="flex-grow">
        <Hero/>
      </div>
      <Footer />
      
      {/* Background blobs */}
      <div className="bg-purple-400/20 absolute -top-40 -left-40 h-[500px] w-[500px] blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="bg-pink-400/20 absolute top-20 right-[-200px] h-[500px] w-[500px] blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="bg-blue-300/20 absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="bg-indigo-300/20 absolute top-[200px] left-1/2 h-[500px] w-[500px] blur-[120px] rounded-full pointer-events-none -z-10"></div>
    </div>
  );
}
