"use client"; // Needed for interactive elements like search input state

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, LifeBuoy, BookOpen, MessageSquare, Mail, Ticket, Info } from "lucide-react";
import { toast } from "sonner"; // For placeholder actions

// Placeholder FAQ data - replace with actual content later
const faqData = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I create an account?", a: "Navigate to the Sign Up page and fill in your details. You&apos;ul receive a confirmation email." },
      { q: "What&apos;t the difference between Business Actor and Customer roles?", a: "Business Actors manage services, products, and organization details. Customers interact with services, manage their profile, and view bonuses." },
      { q: "How do I navigate the dashboard?", a: "Use the sidebar on the left to access different sections. The top navigation provides quick access to notifications and user settings." },
    ],
  },
  {
    category: "Account Management",
    questions: [
      { q: "How do I change my password?", a: "Go to Settings > Security tab. Enter your current password and your desired new password, then confirm and save." },
      { q: "How do I update my profile information?", a: "Go to Settings > Account tab. You can update your name, email, phone, and avatar there." },
      { q: "How do I enable Two-Factor Authentication (2FA)?", a: "Go to Settings > Security tab and toggle the 'Enable Two-Factor Authentication' switch. Follow the on-screen instructions." },
    ],
  },
  {
    category: "Billing & Subscriptions (BA)",
    questions: [
      { q: "How can I view my invoices?", a: "Business Actors can find their invoices under the 'Invoices' section in the sidebar." },
      { q: "How do I upgrade my subscription plan?", a: "Navigate to the 'Subscription' section in the sidebar to view available plans and upgrade options." },
    ],
  },
   {
    category: "Bonus Points (Customer)",
    questions: [
      { q: "How do I check my bonus points?", a: "Customers can view their bonus points balance and history in the 'My Bonus' section." },
      { q: "How can I redeem my points?", a: "Redemption options, if available, will be shown in the 'My Bonus' section under 'Convert My Points'." },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Implement actual search filtering logic
  const handleSearch = () => {
      if (!searchQuery.trim()) {
          toast.info("Please enter a search term.");
          return;
      }
      toast.info(`Search functionality for "${searchQuery}" is not yet implemented.`);
      // Implement filtering of FAQs or linking to relevant docs based on searchQuery
  };

  const handleContactAction = (method: string) => {
      toast.info(`Contacting support via ${method} is not yet implemented.`);
      // TODO: Implement actual action (open chat, link to ticket form, mailto link)
  };


  return (
    // Using container similar to settings page for consistency
    <div className="container mx-auto py-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
           <LifeBuoy className="h-8 w-8 text-primary" />
           <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
         {/* Optional: Link back to dashboard */}
         {/* <Button variant="outline" asChild><Link href="/business-actor/dashboard">Back to Dashboard</Link></Button> */}
      </div>

      {/* Search Section */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">How can we help?</CardTitle>
          <CardDescription>Search our knowledge base or browse FAQs.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange= {(e)  => setSearchQuery(e.target.value)}
              onKeyDown= {(e)  => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button type="button" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((category) => (
                  <div key={category.category} className="mb-4 last:mb-0">
                     <h3 className="text-lg font-semibold mb-2 px-1">{category.category}</h3>
                      {category.questions.map((item, index) => (
                          <AccordionItem value={`${category.category}-${index}`} key={index} className="border-b">
                              <AccordionTrigger className="text-left hover:no-underline px-1">
                                  {item.q}
                              </AccordionTrigger>
                              <AccordionContent className="px-1 text-muted-foreground">
                                  {item.a}
                              </AccordionContent>
                          </AccordionItem>
                      ))}
                  </div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Resources Section */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Contact Support</CardTitle>
              <CardDescription>Can&apos;n find an answer? Get in touch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleContactAction('Ticket')}>
                 <Ticket className="h-5 w-5 text-primary" /> Submit a Ticket
               </Button>
               <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleContactAction('Chat')}>
                 <MessageSquare className="h-5 w-5 text-primary" /> Start Live Chat
               </Button>
               <Button variant="outline" className="w-full justify-start gap-3" onClick={() => handleContactAction('Email')}>
                 <Mail className="h-5 w-5 text-primary" /> Send us an Email
               </Button>
            </CardContent>
          </Card>

           {/* Documentation Card */}
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Documentation</CardTitle>
              <CardDescription>Explore detailed guides and resources.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full justify-start gap-3">
                 {/* TODO: Update this link */}
                <Link href="/docs">
                    <BookOpen className="h-5 w-5 text-primary" /> Browse Guides
                </Link>
              </Button>
            </CardContent>
          </Card>

            {/* What&apos;t New Card */}
            <Card className="shadow-sm">
                <CardHeader>
                <CardTitle className="text-xl">What&apos;t New?</CardTitle>
                <CardDescription>See the latest platform updates.</CardDescription>
                </CardHeader>
                <CardContent>
                <Button variant="outline" asChild className="w-full justify-start gap-3">
                    {/* TODO: Update this link */}
                    <Link href="/whats-new">
                        <Info className="h-5 w-5 text-primary" /> View Changelog
                    </Link>
                </Button>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}