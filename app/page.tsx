import Header from "@/_shared/Header";
import Hero from "@/_shared/Hero";
import Footer from "@/_shared/Footer";
import { Button } from "@/components/ui/button";
import { User } from "@clerk/nextjs/server";
import Image from "next/image";

export default function Home() {
  return (
      <div className="relative overflow-x-hidden min-h-screen flex flex-col w-full">
        <Header />
          <div className="flex-grow w-full">
            <Hero />
          </div>
          <Footer />

          {/* Background blobs isolated in a strict overflow-hidden container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
            <div className="bg-purple-400/20 absolute -top-40 -left-40 h-[500px] w-[500px] blur-[120px] rounded-full"></div>
            <div className="bg-pink-400/20 absolute top-20 -right-24 h-[500px] w-[500px] blur-[120px] rounded-full"></div>
            <div className="bg-blue-300/20 absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] blur-[120px] rounded-full"></div>
            <div className="bg-indigo-300/20 absolute top-[200px] left-1/2 h-[500px] w-[500px] blur-[120px] rounded-full"></div>
          </div>
        </div>
        );
}
