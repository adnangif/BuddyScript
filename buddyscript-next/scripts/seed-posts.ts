import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { posts, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { config } from "dotenv";

// Load environment variables from .env.local and .env
config({ path: ".env.local" });
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const neonClient = neon(connectionString);
const db = drizzle(neonClient, { schema });

const postContents = [
  "Just finished an amazing project! 🚀 The feeling of accomplishment is incredible.",
  "Coffee + Code = Perfect Morning ☕💻",
  "Excited to announce our new product launch next week! Stay tuned for updates.",
  "Learning new technologies every day. The tech world never stops evolving!",
  "Had a productive meeting with the team today. Great ideas were shared! 💡",
  "Sometimes the best solution is the simplest one. Keep it clean and maintainable.",
  "Debugging can be frustrating, but finding the bug is so satisfying! 🐛",
  "Remember to take breaks and stretch. Your health matters! 🧘",
  "Working on improving our app's performance. Every millisecond counts!",
  "Grateful for this amazing community. You all inspire me daily! ❤️",
  "Just deployed to production! Fingers crossed 🤞",
  "Code review time! Always learning from my peers.",
  "Weekend plans: More coding! Anyone else? 😄",
  "The documentation is finally complete. Future me will thank present me.",
  "Collaboration makes everything better. Teamwork for the win! 🤝",
  "Refactoring old code feels like cleaning your room. Satisfying!",
  "Another bug squashed! On to the next challenge.",
  "Reading through some interesting technical articles today.",
  "Unit tests are passing! Green lights all the way ✅",
  "Design thinking session was incredibly productive today.",
  "Just learned about a new design pattern. Mind blown! 🤯",
  "Performance optimization is an art and a science.",
  "Taking a moment to appreciate how far we've come.",
  "The user feedback has been phenomenal. Thank you all!",
  "Building features that users love is the best feeling.",
  "Late night coding session with some good music 🎵",
  "Code quality matters. Don't rush, do it right.",
  "Attending a virtual conference today. Excited to learn!",
  "Sharing knowledge is one of the best parts of this community.",
  "Just hit a major milestone in our project! 🎉",
  "TypeScript is making my code so much safer and cleaner.",
  "The power of automation never ceases to amaze me.",
  "Continuous learning is the key to staying relevant.",
  "Writing clean code is like writing poetry.",
  "Feature flags are a game changer for deployments!",
  "Security first, always. Protecting our users' data.",
  "The cloud infrastructure is running smoothly! ☁️",
  "API design is an art form. REST vs GraphQL debates continue.",
  "Microservices architecture has its pros and cons.",
  "Database optimization saved us significant costs.",
  "Mobile-first design is no longer optional, it's essential.",
  "Accessibility matters! Building for everyone.",
  "Progressive web apps are the future.",
  "Version control has saved me countless times. Git is life!",
  "Code reviews help us grow as developers.",
  "Pair programming session was incredibly productive!",
  "The development environment is finally configured perfectly.",
  "CI/CD pipelines make deployment so much easier!",
  "Testing in production? Not if I can help it! 😅",
  "Docker containers make everything reproducible.",
];

const techPosts = [
  "Exploring the latest React 19 features. Concurrent rendering is amazing!",
  "Just migrated to Next.js 14. The performance improvements are noticeable.",
  "Working with Drizzle ORM has been a pleasant experience.",
  "Tailwind CSS makes styling so much faster and maintainable.",
  "PostgreSQL query optimization tips for better performance.",
  "Understanding database indexes can significantly speed up queries.",
  "Implementing authentication with JWT tokens and refresh tokens.",
  "WebSockets for real-time features are so powerful!",
  "GraphQL subscriptions for live data updates.",
  "Server-side rendering vs Client-side rendering trade-offs.",
];

const motivationalPosts = [
  "Every expert was once a beginner. Keep learning! 📚",
  "Failure is just a stepping stone to success.",
  "Your code doesn't have to be perfect, it just has to work.",
  "Take breaks. Your productivity will thank you.",
  "Imposter syndrome is real, but so is your progress.",
  "Celebrate small wins. They add up to big achievements.",
  "The best time to start was yesterday. The second best is now.",
  "Don't compare your chapter 1 to someone else's chapter 20.",
  "Collaboration over competition. We rise together.",
  "Your unique perspective is valuable. Share your ideas!",
];

const allContents = [...postContents, ...techPosts, ...motivationalPosts];

async function seedPosts() {
  try {
    console.log("🌱 Starting to seed posts...");

    // Get all users from the database
    const allUsers = await db.select().from(users);

    if (allUsers.length === 0) {
      console.error("❌ No users found in the database. Please create users first.");
      process.exit(1);
    }

    console.log(`✅ Found ${allUsers.length} users in the database.`);

    // Create 100 posts with random content and users
    const postsToInsert = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
      const randomContent = allContents[Math.floor(Math.random() * allContents.length)];
      const isPublic = Math.random() > 0.1; // 90% public, 10% private
      
      // Create posts with staggered timestamps (going back in time)
      // This ensures they're created at different times for testing pagination
      const createdAt = new Date(now.getTime() - i * 60 * 1000); // 1 minute apart

      postsToInsert.push({
        userId: randomUser.id,
        content: `${randomContent} #post${100 - i}`,
        isPublic,
        createdAt,
        updatedAt: createdAt,
      });
    }

    // Insert posts in batches of 20
    const batchSize = 20;
    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      await db.insert(posts).values(batch);
      console.log(`📝 Inserted posts ${i + 1} to ${Math.min(i + batchSize, postsToInsert.length)}`);
    }

    console.log("✅ Successfully seeded 100 posts!");
    console.log(`📊 Posts created across ${allUsers.length} users`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding posts:", error);
    process.exit(1);
  }
}

seedPosts();
