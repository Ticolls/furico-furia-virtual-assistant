import puppeteer from "puppeteer";

export async function scrapeMatches() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
  
    await page.goto('https://liquipedia.net/counterstrike/FURIA/Matches');
  
    await page.waitForSelector('#mw-content-text > div > div:nth-child(2) > div.match-table-wrapper.table-responsive > table > tbody');
  
    const matches = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(
        '#mw-content-text > div > div:nth-child(2) > div.match-table-wrapper.table-responsive > table > tbody > tr'
      ));
  
      return rows.map(row => {
        const dateElement = row.querySelector('td span.timer-object-date');
        const tierElement = row.querySelector('td:nth-child(2) a');
        const typeElement = row.querySelector('td:nth-child(3)');
        const opponentElement1 = row.querySelector('td:nth-child(7) > div > span.name > a');
        const opponentElement2 = row.querySelector('td:nth-child(9) > div > span.name > a');
        const scoreElement = row.querySelector('td.match-table-score');
  
        return {
          date: dateElement ? dateElement.textContent?.trim() : '',
          tier: tierElement ? tierElement.textContent?.trim() : '',
          type: typeElement ? typeElement.textContent?.trim() : '',
          opponent1: opponentElement1 ? opponentElement1.textContent?.trim() : '',
          opponent2: opponentElement2 ? opponentElement2.textContent?.trim() : '',
          score: scoreElement ? scoreElement.textContent?.trim() : ''
        };
      });
    });
    
    await browser.close();

    return matches
}