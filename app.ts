import EmailService from "./email";
import ExcelService, { Row } from "./excel";

const venueData = ExcelService.getVenueDataToEmail();

const rows: Row[] = venueData[0].data;

for await (let [index, row] of rows.entries()) {
  if (index === 0) {
    //* this is the column names row, no action needed
    continue;
  }

  if (row[ExcelService.cols["Has Been Emailed"]] !== "Yes") {
    const emails = row[ExcelService.cols["Venue Email"]];
    const venueName = row[ExcelService.cols["Venue Name"]];
    if (emails) {
      for await (let email of emails.split(";")) {
        const to = {
          receiver: venueName,
          to: email,
        };

        await EmailService.sendAvailabilityTemplate(to);

        row[ExcelService.cols["Has Been Emailed"]] = "Yes";
      }
    }
  }

  const newSheet = ExcelService.buildSheet(venueData);

  ExcelService.createFile("send-email-venue-data.xlsx", newSheet);
}
