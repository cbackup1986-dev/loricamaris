import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import MergeClient from './MergeClient';
import { SchemaOrg } from '@/components/common/SchemaOrg';

export const metadata: Metadata = {
  title: `Merge Peak - Weekly Merge Puzzle Challenge | ${siteConfig.name}`,
  description: "Play Merge Peak, a premium merge game with satisfied item combinations and strategic puzzles. Solve the weekly challenge and peak your productivity with LoricaMaris.",
  keywords: ["Merge Peak", "Merge Game Online", "Strategic Puzzle", "Weekly Challenge", "Brain Training", "LoricaMaris Merge"],
};

export default function MergePage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do you play Merge Peak?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Combine identical items to create higher-level items and complete orders from the customers."
        }
      },
      {
        "@type": "Question",
        "name": "What is the goal of the game?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The goal is to complete as many orders as possible and maximize your efficiency in merging."
        }
      }
    ]
  };

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Play Merge Peak",
    "description": "Merge identical items on the board to clear orders and space.",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Drag and drop identical items onto each other to merge them into a new, higher-level item."
      },
      {
        "@type": "HowToStep",
        "text": "Watch the orders panel to see what items are needed to satisfy customer requests."
      },
      {
        "@type": "HowToStep",
        "text": "Manage your board space efficiently and keep merging to reach the highest item tiers."
      }
    ]
  };

  return (
    <>
      <SchemaOrg data={faqData} />
      <SchemaOrg data={howToData} />
      <MergeClient />
    </>
  );
}
