import postgres from 'postgres';

const sql = postgres('postgresql://postgres:postgres@localhost:5432/emailscheduler');

sql`SELECT 1 as n`
  .then((r) => { console.log('Connection OK:', r); process.exit(0); })
  .catch((e) => { console.error('Connection FAILED:', e.message); process.exit(1); });
