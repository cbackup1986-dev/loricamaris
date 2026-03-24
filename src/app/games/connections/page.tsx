import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import ConnectionsClient from './ConnectionsClient';
import { SchemaOrg } from '@/components/common/SchemaOrg';

export const metadata: Metadata = {
  title: `Daily Connections - Free Online Word Grouping Game | ${siteConfig.name}`,
  description: "Play Connections online for free. Find the common link between four words and solve the daily puzzle. Challenge your categories and logic skills with LoricaMaris.",
  keywords: ["Daily Connections", "Connections Online", "Word Grouping Game", "Free Word Puzzles", "Brain Training", "LoricaMaris Connections"],
};

export default function ConnectionsPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do you play Connections?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Find groups of four words that share something in common. Select four items and tap 'Submit' to check if your guess is correct."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a new Connections puzzle every day?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, LoricaMaris provides a fresh Connections challenge every day for your daily dose of logic."
        }
      }
    ]
  };

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Play Connections",
    "description": "Connections is a word game where you group 16 words into four categories of four.",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Look at the 16 words and find a set of four that share a common category or link."
      },
      {
        "@type": "HowToStep",
        "text": "Select the four words and press 'Submit'. If correct, the category and its difficulty level will be revealed."
      },
      {
        "@type": "HowToStep",
        "text": "Repeat until you've found all four groups without making too many mistakes."
      }
    ]
  };

  return (
    <>
      <SchemaOrg data={faqData} />
      <SchemaOrg data={howToData} />
      <ConnectionsClient />
    </>
  );
}
