import { readFile } from "fs/promises";

class MailHistory {
  static async getDontEmailList() {
    try {
      const history = await readFile(`${process.cwd()}/dont-email.json`);
      const emails = JSON.parse(String(history)).emails;
      return emails;
    } catch (error) {
      console.log(error);
    }
  }

  static extractEmails(str: string) {
    const email = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return str.match(email);
  }

  static removeDuplicates(arr: any[] | null) {
    return [...new Set(arr)];
  }
}

export default MailHistory;
