"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Plus,
  LogOut,
  Home,
  MapPin,
  Menu,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "People", icon: LayoutDashboard, exact: true },
  { href: "/admin/people/new", label: "Add person", icon: Plus },
  { href: "/admin/places", label: "Places", icon: MapPin },
  { href: "/search", label: "Public site", icon: Users },
];

export function AdminHeader({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-3 sm:px-6">
        <Link
          href="/admin"
          className="flex min-w-0 shrink items-center gap-2 font-heading font-semibold"
        >
          <BrandMark className="size-6 shrink-0" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 text-sm md:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-2 text-muted-foreground hover:bg-accent hover:text-foreground",
                isActive(item.href, item.exact) && "bg-accent text-foreground"
              )}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <span className="hidden max-w-[12rem] truncate text-xs text-muted-foreground lg:inline">
            {email} · {role}
          </span>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="size-10"
            aria-label="Home"
          >
            <Home className="size-4" />
          </Button>
          <form action={signOutAction} className="hidden sm:block">
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,100vw)]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-heading">
                  <BrandMark className="size-6" />
                  Dashboard
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-col gap-0.5 px-2">
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-3 text-base font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                      isActive(item.href, item.exact) &&
                        "bg-accent text-foreground"
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
                <p className="mt-4 truncate px-3 text-xs text-muted-foreground">
                  {email} · {role}
                </p>
                <form action={signOutAction} className="mt-2 px-1">
                  <Button type="submit" variant="outline" className="w-full">
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                </form>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
