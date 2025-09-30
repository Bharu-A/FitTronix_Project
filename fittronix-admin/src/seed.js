const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedHomepage() {
  const testimonials = [
    { name: "John Doe", role: "Athlete", text: "FitTronix changed my life!", avatar: "https://example.com/avatar1.png" },
    { name: "Jane Smith", role: "Trainer", text: "Best fitness app ever!", avatar: "https://example.com/avatar2.png" }
  ];
  for (const t of testimonials) await db.collection("testimonials").add(t);

  const faqs = [
    { question: "How do I start?", answer: "Just sign up and choose a plan." },
    { question: "Is it free?", answer: "There’s a free trial for 7 days." }
  ];
  for (const f of faqs) await db.collection("faqs").add(f);

  console.log("✅ Homepage seeded!");
}

seedHomepage();
