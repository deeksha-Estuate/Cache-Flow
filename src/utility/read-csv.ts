var fs = require("fs");
var csvParser = require('csv-parser');

// Array to store JSON objects parsed from the CSV
const jsonData: any[] = [];

// Function to read the CSV file and convert its contents to JSON
export async function readCSVFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data: any) => {
                jsonData.push(data);
            })
            .on('end', () => {
                resolve(jsonData);
            })
            .on('error', (error: Error) => {
                reject(error);
            });
    });
}