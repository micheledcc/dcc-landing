import { sql } from "../lib/db";
import { hashPassword } from "../lib/auth";

interface AdminSeed {
  email: string;
  password: string;
  name: string;
}

// Add your co-founders here before running
const admins: AdminSeed[] = [
  {
    email: "michele@digitalcollateralcorporation.com",
    name: "Michele Anastasio",
    password: "CHANGE_ME", // Set a real password before running
  },
  // Add more co-founders:
  // { email: "...", name: "...", password: "..." },
];

async function main() {
  for (const admin of admins) {
    if (admin.password === "CHANGE_ME") {
      console.error(
        `Set a real password for ${admin.email} in scripts/seed.ts before running.`
      );
      process.exit(1);
    }

    const hash = await hashPassword(admin.password);

    await sql`
      INSERT INTO admins (email, password_hash, name)
      VALUES (${admin.email}, ${hash}, ${admin.name})
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${hash},
        name = ${admin.name}
    `;

    console.log(`Seeded admin: ${admin.email}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Failed to seed admins:", e);
  process.exit(1);
});
