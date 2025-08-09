import { readFileSync, writeFileSync } from "fs";
import xlsx, { WorkSheet } from "node-xlsx";
import MailHistory from "../../email/history";

export type Row = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

class ExcelService {
  static parseOldVenueData() {
    const workSheetsFromBuffer = xlsx.parse(
      readFileSync(`${process.cwd()}/excel/venue-data.xlsx`)
    );
    writeFileSync("venue-data.json", JSON.stringify(workSheetsFromBuffer));
  }

  static cols = {
    "Had a show previously": 0,
    "Venue Name": 1,
    "Venue Contact": 2,
    "Main Capacities": 3,
    "Other Capacities": 4,
    Address: 5,
    Town: 6,
    "County ": 7,
    Country: 8,
    Postcode: 9,
    Phone: 10,
    "Venue Email": 11,
    "Venue Website": 12,
    "Has Been Emailed": 13,
  };

  static async markRowsThatRachAndTravHaveEmailed() {
    const venueData = JSON.parse(
      String(readFileSync(`${process.cwd()}/venue-data.json`))
    );

    const dontEmailData: string[] = await MailHistory.getDontEmailList();

    const rows: Row[] = venueData[0].data;

    for (let [index, row] of rows.entries()) {
      if (index === 0) {
        row[this.cols["Has Been Emailed"]] = "Has Been Emailed";
        continue;
      }

      const website = row[this.cols["Venue Website"]];
      const emails = row[this.cols["Venue Email"]]?.split(";");

      if (emails) {
        for (let email of emails) {
          const match = dontEmailData.find((dontEmail) => email === dontEmail);

          if (match) {
            row[this.cols["Has Been Emailed"]] = "Yes";
            continue;
          }
        }

        if (website) {
          const websiteMatch = dontEmailData.find((dontEmail) =>
            website.includes(dontEmail.split("@")[1])
          );

          if (websiteMatch) {
            row[this.cols["Has Been Emailed"]] = "Yes";
            continue;
          }
        }

        row[this.cols["Has Been Emailed"]] = "  ";
      }
    }

    const newSheet = xlsx.build(venueData);

    this.createFile("updated-venue-data.xlsx", newSheet);
  }

  static parseUpdatedVenueData() {
    const workSheetsFromBuffer = xlsx.parse(
      readFileSync(`${process.cwd()}/updated-venue-data.xlsx`)
    );
    writeFileSync(
      "updated-venue-data.json",
      JSON.stringify(workSheetsFromBuffer)
    );
  }

  static getVenueDataToEmail() {
    const venueData = JSON.parse(
      String(readFileSync(`${process.cwd()}/updated-venue-data.json`))
    );
    return venueData;
  }

  static buildSheet(data: WorkSheet<unknown>[]) {
    return xlsx.build(data);
  }

  static createFile(fileName: string, newSheet: Buffer) {
    writeFileSync(fileName, newSheet);
  }
}

export default ExcelService;
