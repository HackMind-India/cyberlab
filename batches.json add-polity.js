// add-polity.js
// LoyalLearn - Add UPSC Polity Questions
// Run: node add-polity.js

const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "batches.json");
const BACKUP = path.join(__dirname, "batches.backup.json");

if (!fs.existsSync(FILE)) {
  console.error("❌ batches.json नहीं मिली!");
  process.exit(1);
}

// --------------------------------------------------
// Read existing batches.json
// --------------------------------------------------

let data;

try {
  data = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (err) {
  console.error("❌ batches.json JSON format में सही नहीं है.");
  console.error(err.message);
  process.exit(1);
}

if (!Array.isArray(data.batches)) {
  console.error("❌ batches.json में 'batches' array नहीं मिला.");
  process.exit(1);
}

// --------------------------------------------------
// Backup
// --------------------------------------------------

fs.copyFileSync(FILE, BACKUP);

console.log("✅ Backup बनाया गया:");
console.log("   batches.backup.json");

// --------------------------------------------------
// Find UPSC Foundation Batch
// --------------------------------------------------

let batch = data.batches.find(
  b => b && b.id === "upsc-foundation"
);

if (!batch) {
  batch = {
    id: "upsc-foundation",
    name: "UPSC Foundation Batch",
    description: "GS + CSAT bilingual practice",
    questions: []
  };

  data.batches.push(batch);

  console.log("ℹ️ UPSC Foundation Batch नहीं मिला था, नया बनाया गया.");
}

if (!Array.isArray(batch.questions)) {
  batch.questions = [];
}

// --------------------------------------------------
// POLITY QUESTIONS
// --------------------------------------------------

const polityQuestions = [

  {
    q: "Which Part of the Indian Constitution contains Fundamental Rights?",
    hi: "भारतीय संविधान के किस भाग में मौलिक अधिकार दिए गए हैं?",
    o: [
      "Part II / भाग II",
      "Part III / भाग III",
      "Part IV / भाग IV",
      "Part V / भाग V"
    ],
    a: 1,
    e: "Fundamental Rights are contained in Part III of the Constitution.",
    eh: "मौलिक अधिकार संविधान के भाग III में दिए गए हैं।",
    subject: "Polity",
    chapter: "Indian Constitution",
    topic: "Fundamental Rights"
  },

  {
    q: "Which Article guarantees equality before law?",
    hi: "कौन-सा अनुच्छेद कानून के समक्ष समानता की गारंटी देता है?",
    o: [
      "Article 12 / अनुच्छेद 12",
      "Article 14 / अनुच्छेद 14",
      "Article 19 / अनुच्छेद 19",
      "Article 21 / अनुच्छेद 21"
    ],
    a: 1,
    e: "Article 14 guarantees equality before law and equal protection of laws.",
    eh: "अनुच्छेद 14 कानून के समक्ष समानता और कानूनों के समान संरक्षण की गारंटी देता है।",
    subject: "Polity",
    chapter: "Fundamental Rights",
    topic: "Right to Equality"
  },

  {
    q: "Which Article abolishes untouchability?",
    hi: "कौन-सा अनुच्छेद अस्पृश्यता को समाप्त करता है?",
    o: [
      "Article 15 / अनुच्छेद 15",
      "Article 16 / अनुच्छेद 16",
      "Article 17 / अनुच्छेद 17",
      "Article 18 / अनुच्छेद 18"
    ],
    a: 2,
    e: "Article 17 abolishes untouchability and prohibits its practice.",
    eh: "अनुच्छेद 17 अस्पृश्यता को समाप्त करता है और इसके आचरण को निषिद्ध करता है।",
    subject: "Polity",
    chapter: "Fundamental Rights",
    topic: "Abolition of Untouchability"
  },

  {
    q: "Which Article protects life and personal liberty?",
    hi: "कौन-सा अनुच्छेद जीवन और व्यक्तिगत स्वतंत्रता की रक्षा करता है?",
    o: [
      "Article 19 / अनुच्छेद 19",
      "Article 20 / अनुच्छेद 20",
      "Article 21 / अनुच्छेद 21",
      "Article 22 / अनुच्छेद 22"
    ],
    a: 2,
    e: "Article 21 protects life and personal liberty.",
    eh: "अनुच्छेद 21 जीवन और व्यक्तिगत स्वतंत्रता की रक्षा करता है।",
    subject: "Polity",
    chapter: "Fundamental Rights",
    topic: "Right to Life"
  },

  {
    q: "Which Article provides the Right to Constitutional Remedies?",
    hi: "कौन-सा अनुच्छेद संवैधानिक उपचार के अधिकार का प्रावधान करता है?",
    o: [
      "Article 30 / अनुच्छेद 30",
      "Article 32 / अनुच्छेद 32",
      "Article 35 / अनुच्छेद 35",
      "Article 36 / अनुच्छेद 36"
    ],
    a: 1,
    e: "Article 32 provides the Right to Constitutional Remedies.",
    eh: "अनुच्छेद 32 संवैधानिक उपचार के अधिकार का प्रावधान करता है।",
    subject: "Polity",
    chapter: "Fundamental Rights",
    topic: "Constitutional Remedies"
  },

  {
    q: "Who is the constitutional head of the Union?",
    hi: "संघ का संवैधानिक प्रमुख कौन होता है?",
    o: [
      "Prime Minister / प्रधानमंत्री",
      "President / राष्ट्रपति",
      "Chief Justice / मुख्य न्यायाधीश",
      "Home Minister / गृह मंत्री"
    ],
    a: 1,
    e: "The President is the constitutional head of the Union.",
    eh: "राष्ट्रपति संघ के संवैधानिक प्रमुख होते हैं।",
    subject: "Polity",
    chapter: "Union Executive",
    topic: "President"
  },

  {
    q: "Who appoints the Prime Minister of India?",
    hi: "भारत के प्रधानमंत्री की नियुक्ति कौन करता है?",
    o: [
      "President / राष्ट्रपति",
      "Lok Sabha Speaker / लोकसभा अध्यक्ष",
      "Chief Justice / मुख्य न्यायाधीश",
      "Election Commission / निर्वाचन आयोग"
    ],
    a: 0,
    e: "The President appoints the Prime Minister.",
    eh: "राष्ट्रपति प्रधानमंत्री की नियुक्ति करते हैं।",
    subject: "Polity",
    chapter: "Union Executive",
    topic: "Prime Minister"
  },

  {
    q: "The Council of Ministers is collectively responsible to which House?",
    hi: "मंत्रिपरिषद सामूहिक रूप से किस सदन के प्रति उत्तरदायी होती है?",
    o: [
      "Rajya Sabha / राज्यसभा",
      "Lok Sabha / लोकसभा",
      "Both Houses / दोनों सदन",
      "President / राष्ट्रपति"
    ],
    a: 1,
    e: "The Council of Ministers is collectively responsible to the Lok Sabha.",
    eh: "मंत्रिपरिषद सामूहिक रूप से लोकसभा के प्रति उत्तरदायी होती है।",
    subject: "Polity",
    chapter: "Union Executive",
    topic: "Council of Ministers"
  },

  {
    q: "Who presides over the Lok Sabha?",
    hi: "लोकसभा की अध्यक्षता कौन करता है?",
    o: [
      "President / राष्ट्रपति",
      "Speaker / अध्यक्ष",
      "Prime Minister / प्रधानमंत्री",
      "Vice-President / उपराष्ट्रपति"
    ],
    a: 1,
    e: "The Speaker presides over the Lok Sabha.",
    eh: "लोकसभा की अध्यक्षता लोकसभा अध्यक्ष करते हैं।",
    subject: "Polity",
    chapter: "Parliament",
    topic: "Lok Sabha Speaker"
  },

  {
    q: "Who is the ex-officio Chairman of the Rajya Sabha?",
    hi: "राज्यसभा का पदेन सभापति कौन होता है?",
    o: [
      "President / राष्ट्रपति",
      "Vice-President / उपराष्ट्रपति",
      "Prime Minister / प्रधानमंत्री",
      "Speaker / अध्यक्ष"
    ],
    a: 1,
    e: "The Vice-President of India is the ex-officio Chairman of the Rajya Sabha.",
    eh: "भारत के उपराष्ट्रपति राज्यसभा के पदेन सभापति होते हैं।",
    subject: "Polity",
    chapter: "Parliament",
    topic: "Rajya Sabha Chairman"
  },

  {
    q: "A Money Bill can be introduced only in which House?",
    hi: "धन विधेयक केवल किस सदन में प्रस्तुत किया जा सकता है?",
    o: [
      "Rajya Sabha / राज्यसभा",
      "Lok Sabha / लोकसभा",
      "Either House / किसी भी सदन में",
      "State Assembly / विधानसभा"
    ],
    a: 1,
    e: "A Money Bill can be introduced only in the Lok Sabha.",
    eh: "धन विधेयक केवल लोकसभा में प्रस्तुत किया जा सकता है।",
    subject: "Polity",
    chapter: "Parliament",
    topic: "Money Bill"
  },

  {
    q: "Who decides whether a bill is a Money Bill?",
    hi: "किसी विधेयक के धन विधेयक होने का निर्णय कौन करता है?",
    o: [
      "President / राष्ट्रपति",
      "Rajya Sabha Chairman / राज्यसभा सभापति",
      "Lok Sabha Speaker / लोकसभा अध्यक्ष",
      "Prime Minister / प्रधानमंत्री"
    ],
    a: 2,
    e: "The Lok Sabha Speaker decides whether a bill is a Money Bill.",
    eh: "लोकसभा अध्यक्ष यह निर्णय करते हैं कि कोई विधेयक धन विधेयक है या नहीं।",
    subject: "Polity",
    chapter: "Parliament",
    topic: "Money Bill"
  },

  {
    q: "Which constitutional Article deals with the Election Commission?",
    hi: "कौन-सा संवैधानिक अनुच्छेद निर्वाचन आयोग से संबंधित है?",
    o: [
      "Article 280 / अनुच्छेद 280",
      "Article 324 / अनुच्छेद 324",
      "Article 315 / अनुच्छेद 315",
      "Article 148 / अनुच्छेद 148"
    ],
    a: 1,
    e: "Article 324 provides for the Election Commission.",
    eh: "अनुच्छेद 324 निर्वाचन आयोग का प्रावधान करता है।",
    subject: "Polity",
    chapter: "Constitutional Bodies",
    topic: "Election Commission"
  },

  {
    q: "Which Article deals with the Finance Commission?",
    hi: "वित्त आयोग किस अनुच्छेद के अंतर्गत आता है?",
    o: [
      "Article 280 / अनुच्छेद 280",
      "Article 324 / अनुच्छेद 324",
      "Article 148 / अनुच्छेद 148",
      "Article 315 / अनुच्छेद 315"
    ],
    a: 0,
    e: "Article 280 provides for the Finance Commission.",
    eh: "अनुच्छेद 280 वित्त आयोग का प्रावधान करता है।",
    subject: "Polity",
    chapter: "Constitutional Bodies",
    topic: "Finance Commission"
  },

  {
    q: "Which writ is used against unlawful detention?",
    hi: "अवैध हिरासत के विरुद्ध कौन-सी रिट जारी की जाती है?",
    o: [
      "Mandamus / परमादेश",
      "Habeas Corpus / बंदी प्रत्यक्षीकरण",
      "Certiorari / उत्प्रेषण",
      "Quo Warranto / अधिकार-पृच्छा"
    ],
    a: 1,
    e: "Habeas Corpus protects personal liberty against unlawful detention.",
    eh: "बंदी प्रत्यक्षीकरण अवैध हिरासत के विरुद्ध व्यक्तिगत स्वतंत्रता की रक्षा करता है।",
    subject: "Polity",
    chapter: "Judiciary",
    topic: "Writs"
  },

  {
    q: "Which is the highest court in India?",
    hi: "भारत का सर्वोच्च न्यायालय कौन-सा है?",
    o: [
      "High Court / उच्च न्यायालय",
      "Supreme Court / सर्वोच्च न्यायालय",
      "District Court / जिला न्यायालय",
      "Tribunal / अधिकरण"
    ],
    a: 1,
    e: "The Supreme Court is the highest court in India.",
    eh: "सर्वोच्च न्यायालय भारत का सर्वोच्च न्यायालय है।",
    subject: "Polity",
    chapter: "Judiciary",
    topic: "Supreme Court"
  },

  {
    q: "Who formally appoints Supreme Court judges?",
    hi: "सर्वोच्च न्यायालय के न्यायाधीशों की औपचारिक नियुक्ति कौन करता है?",
    o: [
      "Prime Minister / प्रधानमंत्री",
      "President / राष्ट्रपति",
      "Parliament / संसद",
      "Chief Justice alone / केवल मुख्य न्यायाधीश"
    ],
    a: 1,
    e: "Supreme Court judges are formally appointed by the President.",
    eh: "सर्वोच्च न्यायालय के न्यायाधीशों की औपचारिक नियुक्ति राष्ट्रपति करते हैं।",
    subject: "Polity",
    chapter: "Judiciary",
    topic: "Supreme Court Judges"
  },

  {
    q: "What is the minimum age to become President of India?",
    hi: "भारत का राष्ट्रपति बनने की न्यूनतम आयु कितनी है?",
    o: [
      "25 years / 25 वर्ष",
      "30 years / 30 वर्ष",
      "35 years / 35 वर्ष",
      "40 years / 40 वर्ष"
    ],
    a: 2,
    e: "The minimum age for election as President is 35 years.",
    eh: "राष्ट्रपति पद के लिए न्यूनतम आयु 35 वर्ष है।",
    subject: "Polity",
    chapter: "Union Executive",
    topic: "President"
  },

  {
    q: "What is the minimum age for Lok Sabha membership?",
    hi: "लोकसभा सदस्य बनने की न्यूनतम आयु कितनी है?",
    o: [
      "18 years / 18 वर्ष",
      "21 years / 21 वर्ष",
      "25 years / 25 वर्ष",
      "30 years / 30 वर्ष"
    ],
    a: 2,
    e: "A person must be at least 25 years old to be a Lok Sabha member.",
    eh: "लोकसभा सदस्य बनने के लिए न्यूनतम आयु 25 वर्ष है।",
    subject: "Polity",
    chapter: "Parliament",
    topic: "Lok Sabha"
  }

];

// --------------------------------------------------
// Prevent duplicate questions
// --------------------------------------------------

const existingKeys = new Set(
  batch.questions.map(q =>
    String(q.q || q.question || "")
      .trim()
      .toLowerCase()
  )
);

let added = 0;
let skipped = 0;

for (const q of polityQuestions) {

  const key = q.q.trim().toLowerCase();

  if (existingKeys.has(key)) {
    skipped++;
    continue;
  }

  batch.questions.push(q);
  existingKeys.add(key);
  added++;
}

// --------------------------------------------------
// Save
// --------------------------------------------------

try {

  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2),
    "utf8"
  );

} catch (err) {

  console.error("❌ File save नहीं हो सकी.");
  console.error(err.message);

  // Restore backup
  fs.copyFileSync(BACKUP, FILE);

  process.exit(1);
}

// --------------------------------------------------
// Final report
// --------------------------------------------------

console.log("");
console.log("======================================");
console.log("       LoyalLearn Polity Updater");
console.log("======================================");
console.log("");
console.log("✅ Questions added :", added);
console.log("⏭️ Duplicates      :", skipped);
console.log("📚 Total questions :", batch.questions.length);
console.log("");
console.log("✅ batches.json successfully updated.");
console.log("");
console.log("Backup:");
console.log("batches.backup.json");
console.log("");
console.log("अब batches.json को GitHub में upload/replace करके");
console.log("Commit changes कर सकते हो.");
console.log("");
