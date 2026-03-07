const pdfParse = require('pdf-parse');

/**
 * Extracts property metadata from a Title Deed PDF buffer.
 */
const extractPdfData = async (fileBuffer) => {
    try {
        const data = await pdfParse(fileBuffer);
        const text = data.text;

        // DEBUG LOGGING for the developer (visible in backend console)
        console.log("---------------- PDF EXTRACTION DEBUG ----------------");
        console.log("RAW TEXT START >>");
        console.log(text);
        console.log("<< RAW TEXT END");

        // Dynamic extraction based on labels
        // Captures everything after the colon until the end of the line
        const parcelMatch = text.match(/Parcel\s*Number:\s*([^\r\n]+)/i);
        const ownerMatch = text.match(/Full\s*Name:\s*([^\r\n]+)/i);
        const countyMatch = text.match(/County:\s*([^\r\n]+)/i);
        const areaMatch = text.match(/([\d.]+)\s*Hectares/i);

        const extracted = {
            parcelNumber: parcelMatch ? parcelMatch[1].trim().toUpperCase() : null,
            ownerName: ownerMatch ? ownerMatch[1].trim().toUpperCase() : null,
            county: countyMatch ? countyMatch[1].trim().toUpperCase() : null,
            area: areaMatch ? areaMatch[1].trim() : null,
        };

        console.log("EXTRACTED OBJECT:", extracted);
        console.log("------------------------------------------------------");

        return extracted;
    } catch (error) {
        console.error('PDF extraction fatal error:', error);
        return { parcelNumber: null, ownerName: null, county: null, area: null };
    }
};

module.exports = extractPdfData;
