"use client";
import { PropsWithChildren } from "react";
import Layout from "@/components/Layout";

export default function ProviderLayout({ children }: PropsWithChildren) {
  return <Layout>{children}</Layout>;
}
