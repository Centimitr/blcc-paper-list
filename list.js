const puppeteer = require('puppeteer');

const ret = str => `${str}\r`;

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://blockchain.whu.edu.cn/blockchainpapers/2019/0124/132.html');

    const list = await page.evaluate(() => {
        const children = document.querySelector('ol').children;
        const items = Array.from(children)
            .map(li => li.textContent)
            .map(text => text.split(','))
            .map(ref => ref.map(str => str.trim()));

        const keywords = [
            ';',
            'http:', 'https:',
            'DOI', 'Conference', 'Journal',
            'IEEE', 'ACM', 'ICAR'];
        const reg = new RegExp(keywords.join('|'));

        const titles = Array.from(items)
            .map(ref => ref.filter(str => !str.match(reg)))
            .map(ref => ref.sort((a, b) => b.length - a.length))
            .map(ref => ref[0]);

        const list = Array.from(items)
            .map((elms, index) => {
                const title = titles[index];
                const pos = elms.indexOf(title);
                const author = elms.slice(0, pos).join(', ');
                const source = elms.slice(pos + 1).join(', ');
                return {author, title, source}
            });
        return list;
    });

    const output = list
        .map(item => [`**${item.title}**`, item.author, item.source].join('  \n'))
        .join('\n\n');

    console.log(output);

    await browser.close();
})();
