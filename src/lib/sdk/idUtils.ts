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

/**
 * Ensures a Guest User (ID: 0001) exists in the database.
 * Returns the user record.
 */
export async function getOrCreateGuestUser() {
  const GUEST_ID = "0001";
  
  // Try to find
  const existing = await prisma.user.findUnique({
    where: { id: GUEST_ID },
    select: { id: true, username: true }
  });

  if (existing) return existing;

  // Create if missing (Self-healing)
  console.log(`[SDK] Creating missing guest user (ID: ${GUEST_ID})...`);
  return await prisma.user.create({
    data: {
      id: GUEST_ID,
      username: 'guest',
      email: 'guest@system.local',
      password: 'no-login'
    },
    select: { id: true, username: true }
  });
}
