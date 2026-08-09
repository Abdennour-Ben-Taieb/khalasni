"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function DemoLink({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const href = user ? "/dashboard" : "/login";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
