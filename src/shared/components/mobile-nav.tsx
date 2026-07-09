"use client";

import { useState } from "react";
import { NavLink } from "@/shared/components/nav-link";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { Menu } from "./icons";

interface NavItem {
  href: string;
  label: string;
}

interface MobileNavProps {
  items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-sm" className="md:hidden" />}>
        <Menu />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>OVGS</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 px-4">
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} onNavigate={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
