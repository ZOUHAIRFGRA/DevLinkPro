import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./mode-toggle";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <MenuIcon className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>DevLink</SheetTitle>
          <SheetDescription>
            Connect, Collaborate, Code
          </SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 py-4">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Features</h3>
            <ul className="grid gap-2">
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Developer Profiles
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Project Matching
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Skill Verification
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Collaboration Tools
                </Link>
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-lg font-semibold">Resources</h3>
            <ul className="grid gap-2">
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
          <Separator />
          <div>
            <h3 className="mb-2 text-lg font-semibold">Main Pages</h3>
            <ul className="grid gap-2">
              <li>
                <Link 
                  href="/projects" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link 
                  href="/developers" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  Find Developers
                </Link>
              </li>
            </ul>
          </div>
          <Separator />
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Theme</span>
              <ModeToggle />
            </div>
            <Button variant="outline" className="w-full">
              Log in
            </Button>
            <Button className="w-full">
              Sign up
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
