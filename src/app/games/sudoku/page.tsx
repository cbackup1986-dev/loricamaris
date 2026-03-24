import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import SudokuClient from './SudokuClient';
import { SchemaOrg } from '@/components/common/SchemaOrg';

export const metadata: Metadata = {
  title: `Daily Sudoku - Free Online Logic Puzzle | ${siteConfig.name}`,
  description: "Play Free Online Sudoku. Challenge your logic with daily puzzles ranging from easy to hard. LoricaMaris's premium Sudoku experience features 4x4, 6x6, and 9x9 grids for everyday brain training.",
  keywords: ["Daily Sudoku", "Sudoku Online", "Free Logic Puzzles", "Sudoku Solver", "Brain Training", "LoricaMaris Sudoku"],
};

export default function SudokuPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is Sudoku free to play?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, LoricaMaris offers free online Sudoku puzzles daily with no registration required."
        }
      },
      {
        "@type": "Question",
        "name": "What grid sizes are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We offer 4x4, 6x6, and 9x9 Sudoku grids to suit all skill levels."
        }
      }
    ]
  };

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Play Sudoku",
    "description": "Sudoku is a logic-based number-placement puzzle. The goal is to fill the grid so that each row, column, and subgrid contains all of the digits.",
    "step": [
      {
        "@type": "HowToStep",
        "text": "Identify empty cells and determine which numbers are missing from the current row, column, or subgrid."
      },
      {
        "@type": "HowToStep",
        "text": "Enter numbers 1 through 9 (or the grid size) into the empty cells ensuring no number repeats in any row, column, or subgrid."
      },
      {
        "@type": "HowToStep",
        "text": "Complete the entire grid to win the level."
      }
    ]
  };

  return (
    <>
      <SchemaOrg data={faqData} />
      <SchemaOrg data={howToData} />
      <SudokuClient />
    </>
  );
}
