import puppeteer from "puppeteer";

interface EventLink {
    title: string;
    url: string;
  }
  
  interface TimelineEvent {
    year: string;
    date: string;
    description: string;
    links: EventLink[];
  }
  
export async function scrapeTimeline() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = 'https://liquipedia.net/counterstrike/FURIA';

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#mw-content-text > div > div:nth-child(7) > div');
    await page.waitForSelector("#mw-content-text > div > div:nth-child(7) > div > div.active > h6")

    const timeline = await page.evaluate(() => {
        const events: TimelineEvent[] = [];
                
        const timelineDiv = document.querySelector('#mw-content-text > div > div:nth-child(7) > div.tabs-content');
        
        if (timelineDiv) {
            const children = timelineDiv.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const yearElement = child.querySelector('h6');
                const year = yearElement?.textContent?.trim() || '';

                if (child.className.match(/content\d+/)) {
                    const eventList = child.querySelectorAll('ul > li');
                    
                    eventList.forEach(eventItem => {
                        const eventText = eventItem.textContent?.trim() ?? '';
                        
                        const eventDate = eventText.split('-')[0].trim();
                        const eventDescription = eventText.split('-')[1].trim();

                        const links: EventLink[] = [];
                        const linkElements = eventItem.querySelectorAll('a');
                        linkElements.forEach(link => {
                            const title = link.getAttribute('title');
                            const href = link.getAttribute('href');
                            if (title && href) {
                                links.push({
                                    title,
                                    url: `https://liquipedia.net${href}`
                                });
                            }
                        });

                        events.push({
                            year: year,
                            date: eventDate,
                            description: eventDescription,
                            links
                        });
                    });
                }
            }
        }

        return events;
    });

    await browser.close();


    return timeline;
}

