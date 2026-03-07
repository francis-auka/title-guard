const pdf = require('pdf-parse');
const pdfParse = pdf.PDFParse || pdf.default || pdf;

const extractPdfData = async (fileBuffer) => {
    try {
        const data = await pdfParse(fileBuffer);
        const text = data.text;

        console.log('Extracted PDF text:', text);

        // Dynamically extract whatever parcel number follows "Parcel Number:"
        const parcelMatch = text.match(/Parcel Number:\s*([A-Z0-9\/]+)/i);

        // Dynamically extract whatever name follows "Full Name:"
        const ownerMatch = text.match(/Full Name:\s*([A-Z\s]+?)(?:\n|ID)/i);

        // Dynamically extract whatever county follows "County:"
        const countyMatch = text.match(/^County:\s*(.+)$/im);

        // Dynamically extract whatever hectare value appears
        const areaMatch = text.match(/([\d.]+)\s*Hectares/i);

        console.log('Extracted fields:', {
            parcelNumber: parcelMatch?.[1],
            ownerName: ownerMatch?.[1],
            county: countyMatch?.[1],
            area: areaMatch?.[1],
        });

        return {
            parcelNumber: parcelMatch ? parcelMatch[1].trim() : null,
            ownerName: ownerMatch ? ownerMatch[1].trim() : null,
            county: countyMatch ? countyMatch[1].trim() : null,
            area: areaMatch ? areaMatch[1].trim() : null,
        };
    } catch (error) {
        console.error('PDF extraction fatal error:', error);
        return { parcelNumber: null, ownerName: null, county: null, area: null };
    }
};

module.exports = extractPdfData;
