import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import WordleClient from './WordleClient';
import { SchemaOrg } from '@/components/common/SchemaOrg';

// Metadata for SEO
export const metadata: Metadata = {
  title: `Daily Wordle - Free Online Word Puzzle Game | ${siteConfig.name}`,
  description: "Challenge yourself with our Daily Wordle. A new 5-letter word every day. Play free online, improve your vocabulary and logic skills with LoricaMaris's premium experience.",
  keywords: ["Daily Wordle", "Wordle Online", "Free Word Games", "Puzzle Solver", "Brain Training", "LoricaMaris Wordle"],
};

export default function WordlePage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Wordle 是免费的吗？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "是的，在 LoricaMaris 上，你可以每天免费玩 Wordle 游戏。"
        }
      },
      {
        "@type": "Question",
        "name": "每天有多少个单词？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "每天都有一个新的关卡和单词供你挑战。"
        }
      }
    ]
  };

  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "如何玩 Wordle",
    "description": "Wordle 是一个每天更新的猜词游戏，玩家有 6 次机会猜出一个 5 位字母的单词。",
    "step": [
      {
        "@type": "HowToStep",
        "text": "输入任何一个有效的 5 字母单词。"
      },
      {
        "@type": "HowToStep",
        "text": "查看颜色反馈：绿色代表位置正确，黄色代表字母存在但位置不对，灰色代表单词中没有该字母。"
      },
      {
        "@type": "HowToStep",
        "text": "根据反馈在 6 次尝试内猜出正确单词。"
      }
    ]
  };

  return (
    <>
      <SchemaOrg data={faqData} />
      <SchemaOrg data={howToData} />
      <WordleClient />
    </>
  );
}
