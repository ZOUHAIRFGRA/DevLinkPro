import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Home() {
	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
				<div className="container px-4 md:px-6">
					<div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
						<div className="flex flex-col justify-center space-y-4">
							<div className="space-y-2">
								<h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
									Connect, Collaborate, Code
								</h1>
								<p className="max-w-[600px] text-muted-foreground md:text-xl">
									DevLink matches developers with projects and collaborators.
									Find your next coding partner or project with our intuitive
									platform.
								</p>
							</div>
							<div className="flex flex-col gap-2 min-[400px]:flex-row">
								<Button size="lg">Get Started</Button>
								<Button size="lg" variant="outline">
									Learn More
								</Button>
							</div>
						</div>
						<div className="flex items-center justify-center">
							<Image
								src="/next.svg"
								alt="DevLink Platform"
								width={550}
								height={310}
								className="rounded-xl object-cover"
								priority
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Features
							</h2>
							<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Everything you need to find the perfect match for your next
								project
							</p>
						</div>
					</div>
					<div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
						<Card className="p-6">
							<CardHeader>
								<CardTitle>Developer Profiles</CardTitle>
								<CardDescription>
									Create detailed profiles showcasing your skills, experience, and
									portfolio
								</CardDescription>
							</CardHeader>
							<div className="p-6">
								<Avatar className="h-12 w-12 mb-4">
									<AvatarImage src="/vercel.svg" alt="User" />
									<AvatarFallback>US</AvatarFallback>
								</Avatar>
								<div className="flex flex-wrap gap-2 mt-2">
									<Badge>React</Badge>
									<Badge>Node.js</Badge>
									<Badge>TypeScript</Badge>
								</div>
							</div>
						</Card>
						<Card className="p-6">
							<CardHeader>
								<CardTitle>Project Matching</CardTitle>
								<CardDescription>
									Find projects that match your skills and interests with our
									smart matching system
								</CardDescription>
							</CardHeader>
							<div className="p-6">
								<Image
									src="/window.svg"
									alt="Project matching"
									width={48}
									height={48}
									className="mb-4"
								/>
								<div className="flex flex-wrap gap-2 mt-2">
									<Badge variant="outline">AI Powered</Badge>
									<Badge variant="outline">Smart Filtering</Badge>
								</div>
							</div>
						</Card>
						<Card className="p-6">
							<CardHeader>
								<CardTitle>Collaboration Tools</CardTitle>
								<CardDescription>
									Connect and communicate with potential collaborators using
									built-in tools
								</CardDescription>
							</CardHeader>
							<div className="p-6">
								<Image
									src="/globe.svg"
									alt="Collaboration"
									width={48}
									height={48}
									className="mb-4"
								/>
								<div className="flex flex-wrap gap-2 mt-2">
									<Badge>In-app Chat</Badge>
									<Badge>Project Dashboard</Badge>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="w-full py-12 md:py-24 lg:py-32">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								How It Works
							</h2>
							<p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Our platform makes it easy to find your next collaboration
							</p>
						</div>
					</div>
					<div className="mx-auto max-w-3xl py-12">
						<Tabs defaultValue="developers" className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="developers">For Developers</TabsTrigger>
								<TabsTrigger value="projects">For Project Owners</TabsTrigger>
							</TabsList>
							<TabsContent value="developers" className="p-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<Card>
										<CardHeader>
											<CardTitle>Step 1</CardTitle>
											<CardDescription>
												Create your developer profile
											</CardDescription>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Step 2</CardTitle>
											<CardDescription>
												Browse available projects
											</CardDescription>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Step 3</CardTitle>
											<CardDescription>
												Connect and start collaborating
											</CardDescription>
										</CardHeader>
									</Card>
								</div>
							</TabsContent>
							<TabsContent value="projects" className="p-4">
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									<Card>
										<CardHeader>
											<CardTitle>Step 1</CardTitle>
											<CardDescription>
												Post your project details
											</CardDescription>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Step 2</CardTitle>
											<CardDescription>
												Review interested developers
											</CardDescription>
										</CardHeader>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Step 3</CardTitle>
											<CardDescription>
												Choose your team and get started
											</CardDescription>
										</CardHeader>
									</Card>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</section>

			{/* Call to Action */}
			<section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
				<div className="container px-4 md:px-6">
					<div className="flex flex-col items-center justify-center space-y-4 text-center">
						<div className="space-y-2">
							<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
								Ready to Get Started?
							</h2>
							<p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
								Join our community of developers and project creators today
							</p>
						</div>
						<div className="flex flex-col gap-2 min-[400px]:flex-row">
							<Button size="lg" variant="secondary">
								Sign Up Now
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
							>
								Learn More
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
