"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, LifeBuoy, BookOpen, MessageSquare, Mail, Ticket, Info } from "lucide-react";
import { toast } from "sonner";

const allFaqData = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I create an account?", a: "Navigate to the Sign Up page from the homepage and fill in your details. You will be asked to log in upon successful registration." },
      { q: "What is the difference between a Customer and a Business Actor?", a: "A Customer account is for personal use, allowing you to interact with services. A Business Actor account unlocks the full suite of tools to create and manage organizations, agencies, employees, and more." },
      { q: "How do I become a Business Actor?", a: "After signing up, click the 'Become a Business Actor' card on your main dashboard. You will be guided through creating your professional profile. Once complete, you can create your first organization." },
    ],
  },
  {
    category: "Account Management",
    questions: [
      { q: "How do I change my password?", a: "Navigate to Settings > Security. You can enter your current password and a new password there." },
      { q: "How can I update my profile information?", a: "Your personal details (name, email, phone) can be changed in Settings > Account. Your professional 'Business Actor' profile can be edited from the 'My BA Profile' link in the sidebar." },
      { q: "How do I change the theme or language?", a: "Display preferences, including theme (light/dark/system), language, and currency, can be found in Settings > Display." },
    ],
  },
  {
    category: "For Business Actors",
    questions: [
      { q: "How do I create my first organization?", a: "After completing your Business Actor onboarding, you will be prompted to create an organization. You can also create new ones at any time by visiting the 'Organizations Hub' and clicking 'New Organization'." },
      { q: "How do I switch between organizations or agencies?", a: "Use the switcher component at the top of the main sidebar. Clicking it will open a dialog allowing you to select an active organization or agency to manage." },
      { q: "What is the difference between an organization and an agency?", a: "An organization is the top-level entity representing your entire business. Agencies are sub-divisions or branches within that organization, each with its own staff and resources." },
      { q: "How do I add an employee to a specific agency?", a: "First, select the agency you want to manage using the agency switcher. Then, navigate to the 'Agency Employees' section and click 'Add Employee'." },
    ],
  },
   {
    category: "For Customers",
    questions: [
      { q: "How do I check my bonus points?", a: "You can view your bonus points balance and transaction history in the 'My Bonus' section of your dashboard." },
      { q: "How can I find services?", a: "The 'Services' link in your dashboard will take you to a marketplace where you can browse and reserve services offered by various organizations on the platform." },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqData = useMemo(() => {
    if (!searchQuery.trim()) {
      return allFaqData;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = allFaqData.map(category => {
      const filteredQuestions = category.questions.filter(
        item => item.q.toLowerCase().includes(lowerCaseQuery) || item.a.toLowerCase().includes(lowerCaseQuery)
      );
      return { ...category, questions: filteredQuestions };
    }).filter(category => category.questions.length > 0);

    return filtered;
  }, [searchQuery]);

  const handleSearch = () => {
      if (!searchQuery.trim()) {
          toast.info("Please enter a search term.");
          return;
      }
      if (filteredFaqData.length === 0) {
        toast.info(`No results found for "${searchQuery}".`);
      }
  };

  const handleContactAction = (method: string) => {
      toast.info(`Contacting support via ${method} is a placeholder action.`);
  };

  return (
    <div className="container mx-auto py-8 pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
           <LifeBuoy className="h-8 w-8 text-primary" />
           <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
      </div>

      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">How can we help?</CardTitle>
          <CardDescription>Search our knowledge base or browse frequently asked questions.</CardDescription>
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
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaqData.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqData.map((category) => (
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
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No results found for your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Contact Support</CardTitle>
              <CardDescription>Can't find an answer? Get in touch.</CardDescription>
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

           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Documentation</CardTitle>
              <CardDescription>Explore detailed guides and API resources.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full justify-start gap-3">
                <Link href="/docs">
                    <BookOpen className="h-5 w-5 text-primary" /> Browse Guides
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
