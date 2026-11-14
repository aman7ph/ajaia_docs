import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";

const SEED = [
  { name: "Alice Owner", email: "alice@ajaia.test" },
  { name: "Bob Editor", email: "bob@ajaia.test" },
  { name: "Carol Viewer", email: "carol@ajaia.test" },
];

async function main() {
  await db.insert(users).values(SEED).onConflictDoNothing();
  console.log("Seeded users:", SEED.map((u) => u.email).join(", "));
  process.exit(0);
}
main();
