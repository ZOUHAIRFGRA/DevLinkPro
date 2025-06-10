import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Cookie, Shield, Settings, Eye, BarChart3, Target, Clock } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
            <Cookie className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Understanding how DevLink uses cookies and similar technologies
        </p>
        <Badge variant="outline" className="mb-4">
          Last updated: December 2024
        </Badge>
      </div>

      {/* Quick Overview */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <h3 className="font-medium">Essential Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Required for basic platform functionality.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h3 className="font-medium">Analytics Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Help us improve your experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">Preference Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  Remember your settings and choices.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {/* What are Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>1. What are Cookies?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences and 
              understanding how you use our platform.
            </p>
            <p className="text-sm text-muted-foreground">
              Similar technologies include web beacons, pixels, and local storage, which serve 
              similar purposes to cookies.
            </p>
          </CardContent>
        </Card>

        {/* How We Use Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              DevLink uses cookies for several important purposes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Authentication and security</li>
              <li>• Remembering your preferences and settings</li>
              <li>• Analyzing platform usage and performance</li>
              <li>• Providing personalized content and features</li>
              <li>• Improving our services and user experience</li>
            </ul>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>3. Types of Cookies We Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Essential Cookies</h3>
                <Badge variant="secondary" className="text-xs">Required</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies are necessary for the website to function properly:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Authentication tokens (keeps you logged in)</li>
                <li>• Session management</li>
                <li>• Security and fraud prevention</li>
                <li>• Basic functionality and navigation</li>
                <li>• Form data preservation</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-purple-500" />
                <h3 className="font-medium">Preference Cookies</h3>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies remember your choices and preferences:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Theme preferences (dark/light mode)</li>
                <li>• Language settings</li>
                <li>• Dashboard layout preferences</li>
                <li>• Notification settings</li>
                <li>• Filter and search preferences</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Analytics Cookies</h3>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us understand how you use our platform:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Page views and user journeys</li>
                <li>• Feature usage statistics</li>
                <li>• Performance monitoring</li>
                <li>• Error tracking and debugging</li>
                <li>• A/B testing and improvements</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-orange-500" />
                <h3 className="font-medium">Marketing Cookies</h3>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                These cookies help us provide relevant content:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Personalized project recommendations</li>
                <li>• Tailored developer suggestions</li>
                <li>• Relevant skill-based content</li>
                <li>• Social media integration</li>
                <li>• Email campaign optimization</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Duration */}
        <Card>
          <CardHeader>
            <CardTitle>4. Cookie Duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <h3 className="font-medium">Session Cookies</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Temporary cookies that expire when you close your browser. Used for authentication 
                and basic functionality during your session.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-green-500" />
                <h3 className="font-medium">Persistent Cookies</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Cookies that remain on your device for a set period (typically 30 days to 2 years). 
                Used for remembering preferences and providing personalized experiences across visits.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>5. Third-Party Cookies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Some cookies are set by third-party services we use to enhance your experience:
            </p>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Authentication Providers</h3>
                <p className="text-sm text-muted-foreground">
                  GitHub, Google, and other OAuth providers may set cookies during sign-in.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Analytics Services</h3>
                <p className="text-sm text-muted-foreground">
                  Services like Google Analytics help us understand platform usage patterns.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Communication Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time messaging and notification services may use cookies for functionality.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card>
          <CardHeader>
            <CardTitle>6. Managing Your Cookie Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Platform Settings</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You can manage your cookie preferences through your DevLink account settings:
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings/privacy">
                  <Settings className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Link>
              </Button>
            </div>

            <div>
              <h3 className="font-medium mb-2">Browser Settings</h3>
              <p className="text-sm text-muted-foreground mb-2">
                You can also control cookies through your browser settings:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Block all cookies (may break functionality)</li>
                <li>• Block third-party cookies only</li>
                <li>• Delete existing cookies</li>
                <li>• Set preferences for specific websites</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Disabling essential cookies may prevent you from using 
                certain features of DevLink, including authentication and core functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Updates to Policy */}
        <Card>
          <CardHeader>
            <CardTitle>7. Updates to This Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              We may update this Cookie Policy from time to time to reflect changes in our 
              practices or for legal and regulatory reasons. We will notify you of significant 
              changes through email or platform notifications.
            </p>
            <p className="text-sm text-muted-foreground">
              Please review this policy periodically to stay informed about our use of cookies.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>8. Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: privacy@devlink.com</p>
              <p>Data Protection Officer: dpo@devlink.com</p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
