import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background mt-auto">
      <div className="container flex flex-col gap-8 py-8 md:py-12 px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Platform</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/projects" className="hover:underline">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link href="/projects/create" className="hover:underline">
                  Create Project
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:underline">
                  Find Developers
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Features</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/matches" className="hover:underline">
                  Project Matching
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:underline">
                  Applications
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:underline">
                  Messaging
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Support</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/help" className="hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:underline">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:underline">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:underline">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:gap-0">
            <Link href="/" className="text-xl font-bold">
              DevLink
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting developers with exciting projects
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="mailto:contact@devlink.com" className="text-muted-foreground hover:text-foreground">
              <Mail className="h-5 w-5" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground md:flex-row md:justify-between">
          <p>© 2024 DevLink. All rights reserved.</p>
          <p>Made with ❤️ by <span><a href="http://github.com/Zouhairfgra">@Zouhair Fouiguira</a> for the developer community</span></p>
        </div>
      </div>
    </footer>
  );
}