import { db } from "../src/lib/db";

async function main() {
  try {
    const res: any = await db.$queryRaw`
      SELECT count(*) as total_connections, 
             state, 
             application_name 
      FROM pg_stat_activity 
      GROUP BY state, application_name;
    `;
    console.log("Current DB connections on server:", res);

    const maxConn: any = await db.$queryRaw`SHOW max_connections;`;
    console.log("PostgreSQL max_connections setting:", maxConn);
  } catch (err) {
    console.error("Query failed:", err);
  } finally {
    await db.$disconnect();
  }
}

main();
