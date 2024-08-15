const apiUrl = "https://api.experte.com/tools/vat?ids=";
const fs = require('fs');
const path = require('path');
const fastCsv = require('fast-csv');

const getVatDetails = async (vatId) => {
  try {
    const response = await fetch(`${apiUrl}${vatId}`);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const dataArray = await response.json();
    invalidNums = "Nothing";
    validNums = "Nothing";
    for(let i = 0; i < dataArray.length; i++)
    {
      let data = dataArray[i];
      if (data.status == "valid") {
        const { id, country, name, address } = data;
        console.log(`VAT: ${id}, Name: ${name}, Country: ${country}`);
        const filePath = 'vat.csv';
        const fileExists = fs.existsSync(filePath);
        const headers = "id,country,name\n";
  
        // Convert data to CSV format
        const csvLine = `${id},${country},${name}\n`;
  
        // Append data to CSV file
        fs.appendFileSync(filePath, fileExists ? csvLine : headers + csvLine, 'utf8');
        if (name === "Remy Allard") {
          process.exit();
        }
        validNums += `, ${id}`;
      } else {
        invalidNums += `, ${data.id}`;
      }
    }

    // console.log(`${invalidNums} are invalid and ${validNums} are valid`);

  } catch (error) {
    console.error("Error fetching VAT details:", error);
  }
};

const processRequests = async (st, ed) => {
  let interval = ed - st;
  for (let i = st; i < ed; i+=20) {
    let ids = `DK${i}`;
    let end = i+20 > ed ? ed : i+20;
    for(let j = i+1; j < end; j++)
      ids += `,DK${j}`
    await getVatDetails(ids);
    console.log(`${(i-st)/interval*100} % done`);
  }
};

const processVatIds = async (st, ed, requestsPerPromise) => {
  const totalRequests = ed - st;
  const numPromises = Math.ceil(totalRequests / requestsPerPromise);
  let promises = [];
  for(let i = 0; i < numPromises; i++) {
    // console.log(st + i * requestsPerPromise, st + (i + 1) * requestsPerPromise)
    let end = st + (i + 1) * requestsPerPromise;
    if(end > ed) end = ed;
    promises.push(processRequests(st + i * requestsPerPromise, end));
  }

  Promise.all(promises);
};

const start = 20000000,
  end = 29999999,
  limit = 1000000;
processVatIds(start, end, limit);

// getVatDetails("DK31418666,DK41008644")
