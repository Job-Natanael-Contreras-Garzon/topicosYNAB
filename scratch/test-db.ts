import { db } from "../src/lib/db";

async function main() {
  try {
    const userCount = await db.user.count();
    console.log("DB Connection SUCCESS! User count:", userCount);
    const users = await db.user.findMany({ select: { id: true, email: true, name: true } });
    console.log("Users:", users);
  } catch (err) {
    console.error("DB Connection FAILED:", err);
  } finally {
    await db.$disconnect();
  }
}

main();
