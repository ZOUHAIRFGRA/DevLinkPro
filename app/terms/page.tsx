import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scale, FileText, Shield, Users } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground">
          Please read these terms carefully before using DevLink
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: December 1, 2024
        </p>
      </div>

      {/* Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-500" />
            Terms Overview
          </CardTitle>
          <CardDescription>
            Key points about using DevLink
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Platform Purpose</h3>
                <p className="text-sm text-muted-foreground">
                  DevLink connects developers with projects and facilitates collaboration.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Community Guidelines</h3>
                <p className="text-sm text-muted-foreground">
                  Respectful behavior and professional conduct are required.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-500 mt-1" />
              <div>
                <h3 className="font-medium">User Responsibility</h3>
                <p className="text-sm text-muted-foreground">
                  Users are responsible for their content and interactions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Intellectual Property</h3>
                <p className="text-sm text-muted-foreground">
                  Respect intellectual property rights of others.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Acceptance of Terms */}
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              By accessing or using DevLink (&quot;the Service&quot;), you agree to be bound by these Terms of Service 
              (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-sm text-muted-foreground">
              These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </CardContent>
        </Card>

        {/* Description of Service */}
        <Card>
          <CardHeader>
            <CardTitle>2. Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              DevLink is a platform that connects developers with projects and other developers for 
              collaboration purposes. Our services include:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Developer profile creation and management</li>
              <li>• Project discovery and matching</li>
              <li>• Communication tools for collaboration</li>
              <li>• Skill verification and showcase features</li>
              <li>• Community forums and support</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Account Creation</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• You must provide accurate and complete information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• One person may only maintain one account</li>
                <li>• You must be at least 13 years old to use the Service</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Account Responsibility</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Keep your password secure and confidential</li>
                <li>• Notify us immediately of any unauthorized access</li>
                <li>• You are responsible for all activities under your account</li>
                <li>• We reserve the right to suspend accounts for violations</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* User Conduct */}
        <Card>
          <CardHeader>
            <CardTitle>4. User Conduct and Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Acceptable Use</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You agree to use DevLink responsibly and in accordance with these guidelines:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Treat all users with respect and professionalism</li>
                <li>• Provide accurate information about your skills and experience</li>
                <li>• Respect intellectual property rights</li>
                <li>• Only post content you have the right to share</li>
                <li>• Follow applicable laws and regulations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Prohibited Activities</h3>
              <p className="text-sm text-muted-foreground mb-3">
                The following activities are strictly prohibited:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Harassment, abuse, or discrimination</li>
                <li>• Spam, fraudulent, or deceptive practices</li>
                <li>• Sharing malicious code or security threats</li>
                <li>• Impersonation or false representation</li>
                <li>• Scraping or automated data collection</li>
                <li>• Violating others&apos; privacy or intellectual property</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card>
          <CardHeader>
            <CardTitle>5. Intellectual Property Rights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Your Content</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• You retain ownership of content you create and share</li>
                <li>• You grant us license to display and distribute your content on the platform</li>
                <li>• You represent that you have rights to all content you share</li>
                <li>• You are responsible for obtaining necessary permissions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Platform Content</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• DevLink and its original content are protected by copyright</li>
                <li>• You may not copy, modify, or distribute our platform code</li>
                <li>• All trademarks and logos are property of their owners</li>
                <li>• User-generated content belongs to its creators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Privacy and Data */}
        <Card>
          <CardHeader>
            <CardTitle>6. Privacy and Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. Our collection and use of personal information is 
              governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/privacy">View Privacy Policy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers and Limitations */}
        <Card>
          <CardHeader>
            <CardTitle>7. Disclaimers and Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Service Availability</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• The Service is provided &quot;as is&quot; without warranties</li>
                <li>• We don&apos;t guarantee uninterrupted or error-free service</li>
                <li>• We may modify or discontinue features at any time</li>
                <li>• We are not responsible for user-generated content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Collaboration Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                DevLink facilitates connections between developers but is not responsible for 
                the outcome of collaborations, project success, or disputes between users. 
                Users enter into collaborations at their own risk.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card>
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Account Termination</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• You may delete your account at any time</li>
                <li>• We may suspend or terminate accounts for violations</li>
                <li>• Termination doesn&apos;t affect existing legal obligations</li>
                <li>• Some provisions survive account termination</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Effect of Termination</h3>
              <p className="text-sm text-muted-foreground">
                Upon termination, your access to the Service will cease, and we may delete 
                your account data. You remain responsible for any outstanding obligations.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card>
          <CardHeader>
            <CardTitle>9. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              We reserve the right to modify these Terms at any time. We will notify users of 
              significant changes via email or platform notifications. Continued use of the 
              Service after changes constitutes acceptance of the new Terms.
            </p>
            <p className="text-sm text-muted-foreground">
              It is your responsibility to review these Terms periodically for updates.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>10. Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: legal@devlink.com</p>
              <p>Support: support@devlink.com</p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/help">Help Center</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
