"use client";
import type { PropsWithChildren } from "react";
import { Toaster } from "react-hot-toast";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-gradient-orc">
      <Toaster />
      {children}
    </div>
  );
}
