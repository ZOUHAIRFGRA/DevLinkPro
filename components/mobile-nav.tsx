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
import { auth, signOut } from "@/auth";
import { 
  User, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Target, 
  Search, 
  Heart,
  Code,
  MessageSquare 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function MobileNav() {
  const session = await auth();

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
        <nav className="flex flex-col gap-4 py-4 pl-4">
          {/* Main Navigation */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Navigation</h3>
            <ul className="grid gap-3 pl-2">
              <li>
                <Link 
                  href="/projects" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Code className="h-4 w-4" />
                  Browse Projects
                </Link>
              </li>
              {session && (
                <>
                  <li>
                    <Link 
                      href="/discovery" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      Discovery
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/matches" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                      Matches
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/applications" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Target className="h-4 w-4" />
                      Applications
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/chat" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Chats
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {session && (
            <>
              <Separator />
              
              {/* User Profile Section */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Account</h3>
                <div className="flex items-center gap-3 mb-4 pl-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
                <ul className="grid gap-3 pl-2">
                  <li>
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/settings" 
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </li>
                </ul>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Theme and Authentication */}
          <div className="pl-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Theme</span>
              <ModeToggle />
            </div>
            
            {session ? (
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/sign-in">Log in</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </div>
            )}
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
