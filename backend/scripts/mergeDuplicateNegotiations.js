const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const Negotiation = require("../models/Negotiation");
const connectDB = require("../config/db");

async function mergeDuplicates() {
  await connectDB();
  console.log("Database connected. Starting duplicate merge script...");

  try {
    const allNegotiations = await Negotiation.find({}).lean();
    console.log(`Found ${allNegotiations.length} total negotiation documents.`);

    // 1. Group negotiations
    const groups = {};
    for (const neg of allNegotiations) {
      if (!neg.listing || !neg.farmer || !neg.millOwner) continue; // Skip corrupted docs

      const key = `${neg.listing.toString()}-${neg.farmer.toString()}-${neg.millOwner.toString()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(neg);
    }

    let deletedCount = 0;
    let mergedCount = 0;

    // Save backup first
    const backupPath = path.join(__dirname, "../scratch_backup_negotiations.json");
    fs.writeFileSync(backupPath, JSON.stringify(allNegotiations, null, 2));
    console.log(`✅ Backup saved to ${backupPath}`);

    // 2. Process groups
    for (const key of Object.keys(groups)) {
      const docs = groups[key];

      if (docs.length > 1) {
        console.log(`Duplicate group found for ${key}. Found ${docs.length} documents.`);

        // Sort documents so first one is the oldest (we will keep this one as base so _id does not change if referenced)
        // Or actually, sort by updatedAt to keep the LATEST one as the primary document?
        // If we keep the oldest one, its _id might be referenced elsewhere (though not likely? mostly only Notification references listing, not negotiation)
        // Let's use the one with the latest updatedAt as the master, to preserve status cleanly.
        docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        const primary = docs[0];
        const duplicates = docs.slice(1);

        // Merge messages
        let allMessages = [...primary.messages];
        for (const dup of duplicates) {
          allMessages = allMessages.concat(dup.messages);
        }

        // Sort messages by createdAt naturally
        allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        // Use the primary document and update its messages
        const primaryDoc = await Negotiation.findById(primary._id);
        primaryDoc.messages = allMessages;

        await primaryDoc.save();
        mergedCount++;

        // Delete duplicates
        for (const dup of duplicates) {
          await Negotiation.findByIdAndDelete(dup._id);
          deletedCount++;
        }
      }
    }

    console.log(`\n🎉 Duplicate merge complete.`);
    console.log(`Merged ${mergedCount} negotiation groups.`);
    console.log(`Deleted ${deletedCount} duplicate negotiation documents.`);

    console.log("Creating unique indexes now to prevent future duplicates...");
    await Negotiation.syncIndexes();
    console.log("Unique indexes synced.");

  } catch (err) {
    console.error("Error during merge:", err);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

mergeDuplicates();
