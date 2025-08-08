import EmailService from "./email";
import { emailAddresses } from "./travs-emails";
import fs from "fs/promises";

const BATCH_AMOUNT = 10;
const END = emailAddresses.length;

let last_index = 0;
let batch_count_since_timeout = 0;
let successful_email_count = 0;
let rejected_email_count = 0;

console.log(
  `😁 Bot Started - emailing ${emailAddresses.length} email addresses with Travs LTLO EPK Email`
);

while (true) {
  const batch = emailAddresses.slice(last_index, last_index + BATCH_AMOUNT);

  const promises = batch.map((email) => EmailService.sendTravsEmail(email));

  const sendBatch = await Promise.allSettled(promises);

  const batch_successful_emails: string[] = [];

  for (let [index, result] of sendBatch.entries()) {
    if (result.status === "rejected") {
      console.error(`❌ Error sending email to: ${batch[index]}`);
      rejected_email_count++;
    } else {
      console.log(`✅ Successfully emailed ${batch[index]}`);
      successful_email_count++;
      batch_successful_emails.push(batch[index]);
    }
  }

  last_index = last_index + BATCH_AMOUNT;

  let existing_succesful_emails: string[] = [];

  const data = await fs.readFile("travs_sent.json", "utf-8");

  if (data) {
    existing_succesful_emails = JSON.parse(data);
  }

  const allSentEmails = [
    ...existing_succesful_emails,
    ...batch_successful_emails,
  ];

  await fs.writeFile("travs_sent.json", JSON.stringify(allSentEmails, null, 2));

  console.log(`🧮 Current successful email total: ${successful_email_count}`);
  console.log(`🧮 Current rejected email total: ${rejected_email_count}`);
  console.log("🧑🏾‍💻 Updated sent email doc");

  if (last_index >= END) {
    console.log("🚀 Finished sending all emails");
    break;
  }

  if (batch_count_since_timeout === 3) {
    console.log(
      "😴 Sent 40 emails in the last 60 seconds - Sleeping for 45 seconds to not overload the Gmail API and get flagged for spam"
    );
    await EmailService.fakeLongLoadPromise(45000);
    batch_count_since_timeout = 0;
  } else {
    batch_count_since_timeout++;
  }
}
