import prisma from "@/lib/prisma";

/**
 * Generates a custom User ID in the format: YYYYMMDDHHMM + 5-digit sequence.
 * Example: 20240320153000001
 * 
 * Handles concurrency by querying the database for the last sequence in the same minute.
 */
export async function generateNextUserId(): Promise<string> {
  const now = new Date();
  
  // Format: YYYYMMDDHHMM
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const prefix = `${year}${month}${day}${hours}${minutes}`;

  // Find the highest ID for this minute
  const lastUser = await prisma.user.findFirst({
    where: { id: { startsWith: prefix } },
    orderBy: { id: 'desc' },
    select: { id: true }
  });

  let sequence = 1;
  if (lastUser) {
    const lastSequence = parseInt(lastUser.id.slice(12), 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  // Pad to 5 digits
  return `${prefix}${String(sequence).padStart(5, '0')}`;
}

