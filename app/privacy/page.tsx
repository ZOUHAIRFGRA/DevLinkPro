import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Eye, Lock, Users, Download, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-muted-foreground">
          Your privacy is important to us. Learn how we collect, use, and protect your data.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Last updated: December 1, 2024
        </p>
      </div>

      {/* Quick Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Privacy at a Glance
          </CardTitle>
          <CardDescription>
            Key points about how we handle your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Data Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  We only collect data necessary to provide our services and improve your experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Your data is encrypted and stored securely using industry-standard practices.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-orange-500 mt-1" />
              <div>
                <h3 className="font-medium">No Data Selling</h3>
                <p className="text-sm text-muted-foreground">
                  We never sell your personal data to third parties or advertisers.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Data Control</h3>
                <p className="text-sm text-muted-foreground">
                  You can download, modify, or delete your data at any time through your account.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* Information We Collect */}
        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Account Information</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When you create an account, we collect:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Name and email address</li>
                <li>• GitHub profile information (when using GitHub authentication)</li>
                <li>• Profile photo and bio</li>
                <li>• Skills and experience information</li>
                <li>• Social media links you choose to share</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Usage Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                To improve our services, we collect:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Pages you visit and features you use</li>
                <li>• Projects you view and apply to</li>
                <li>• Search queries and filter preferences</li>
                <li>• Device and browser information</li>
                <li>• IP address and general location</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Communication Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When you interact with others on our platform:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Messages and chat history</li>
                <li>• Project applications and responses</li>
                <li>• Feedback and support requests</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Your Information */}
        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Service Provision</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Create and maintain your account</li>
                <li>• Match you with relevant projects and developers</li>
                <li>• Enable communication with other users</li>
                <li>• Process project applications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Platform Improvement</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Analyze usage patterns to improve features</li>
                <li>• Personalize your experience</li>
                <li>• Develop new features and services</li>
                <li>• Prevent fraud and abuse</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Communication</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Send important account notifications</li>
                <li>• Provide customer support</li>
                <li>• Share platform updates (with your consent)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Public Information</h3>
              <p className="text-sm text-muted-foreground">
                Your profile information (name, bio, skills, portfolio links) is visible to other 
                users to facilitate collaboration. You control what information to make public.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Limited Sharing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                We may share your information only in these circumstances:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and prevent fraud</li>
                <li>• With trusted service providers (under strict agreements)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">No Data Selling</h3>
              <p className="text-sm text-muted-foreground">
                We never sell, rent, or lease your personal information to third parties for 
                marketing purposes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Access and Control</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• View and download your data through your account settings</li>
                <li>• Update or correct your profile information</li>
                <li>• Delete your account and associated data</li>
                <li>• Control what information is public or private</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Communication Preferences</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Opt out of non-essential emails</li>
                <li>• Manage notification settings</li>
                <li>• Control marketing communications</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Data Portability</h3>
              <p className="text-sm text-muted-foreground">
                You can export your data in a structured format to use with other services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Protection Measures</h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• End-to-end encryption for sensitive data</li>
                <li>• Secure data transmission (HTTPS/TLS)</li>
                <li>• Regular security audits and updates</li>
                <li>• Access controls and authentication</li>
                <li>• Backup and disaster recovery procedures</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">Data Retention</h3>
              <p className="text-sm text-muted-foreground">
                We retain your data only as long as necessary to provide services or as required 
                by law. Deleted accounts are permanently removed within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Questions About Privacy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about this privacy policy or how we handle your data, 
              please don&apos;t hesitate to contact us.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings">Privacy Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
