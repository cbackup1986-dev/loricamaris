import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import NumbrixClient from './NumbrixClient';
import { SchemaOrg } from '@/components/common/SchemaOrg';

export const metadata: Metadata = {
  title: `Daily Numbrix - Free Online Logic Puzzle Game | ${siteConfig.name}`,
  description: "Play Numbrix online for free. Fill the grid with consecutive numbers to create a continuous path. A brain-boosting daily logic puzzle from LoricaMaris.",
  keywords: ["Daily Numbrix", "Numbrix Online", "Consecutive Number Puzzle", "Free Logic Games", "Brain Training", "LoricaMaris Numbrix"],
};

export default function NumbrixPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do you solve a Numbrix puzzle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fill the grid with consecutive numbers from 1 to the max size, ensuring each number is horizontally or vertically adjacent to the next."
        }
      },
      {
        "@type": "Question",
        "name": "Is Numbrix a daily game?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, LoricaMaris offers a new Numbrix challenge every day to keep your mind sharp."
        }
      }
    ]
  };

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Play Numbrix",
    "description": "Numbrix is a logic puzzle where you fill a grid with consecutive numbers in a single path.",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Find the starting number (1) and the ending number (max) already placed on the grid."
      },
      {
        "@type": "HowToStep",
        "text": "Fill in the missing numbers consecutively so that each number is next to the previous one (up, down, left, or right)."
      },
      {
        "@type": "HowToStep",
        "text": "Complete the path to fill the entire grid correctly."
      }
    ]
  };

  return (
    <>
      <SchemaOrg data={faqData} />
      <SchemaOrg data={howToData} />
      <NumbrixClient />
    </>
  );
}
