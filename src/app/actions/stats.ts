"use server"

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function recordPlay(data: {
  gameId: string;
  status: string;
  score?: number;
  level?: number;
  details?: any;
}) {
  const session = await auth();
  
  // Even if not logged in, we might want to store it (analytics), 
  // but for ranking we definitely need a user.
  // The user specifically said "registration for ranking".

  try {
    const record = await prisma.workRecord.create({
      data: {
        userId: session?.user?.id || null,
        workId: data.gameId,
        status: data.status,
        score: data.score || 0,
        level: data.level,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
    return { success: true, record };
  } catch (e) {
    console.error("Failed to record play:", e);
    return { error: "Failed to save record" };
  }
}

export async function getGlobalStats() {
  const session = await auth();

  // Aggregate stats
  const totalGames = await prisma.workRecord.count();
  const personalRecords = session?.user?.id 
    ? await prisma.workRecord.findMany({ where: { userId: session.user.id } })
    : [];

  // Simple leaderboard - e.g., top levels in Wordle/Sudoku
  const wordleLeaderboard = await prisma.workRecord.findMany({
    where: { workId: 'wordle', status: 'won' },
    orderBy: { score: 'desc' },
    take: 10,
    include: { user: { select: { username: true } } }
  });

  const sudokuLeaderboard = await prisma.workRecord.findMany({
    where: { workId: 'sudoku' },
    orderBy: { level: 'desc' },
    take: 10,
    include: { user: { select: { username: true } } }
  });

  return {
    totalGames,
    personalRecords,
    leaderboards: {
      wordle: wordleLeaderboard,
      sudoku: sudokuLeaderboard
    }
  };
}
