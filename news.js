const fetch = require("https").get;
const parseXML = new (require("xml2js")).Parser();

class News {
    constructor(response) {
        if (!response.tile || !response.tile.visual) return;
        const raw = response.tile.visual[0];
        this.bindings = {
            branding: raw.binding[0].$.branding,
            contentID: raw.binding[0].$.arguments.split("contentID=")[1],
            hintOverlay: parseInt(raw.binding[0].$['hint-overlay'])
        };
        this.text = raw.binding[0].text[0]._;
        this.image = raw.binding[0].image ? (raw.$.baseUri + raw.binding[0].image[0].$.src.split(`?`)[0]) : null;
        raw.binding.forEach(binding => {
			const imageObject = this.image ? {
                url: raw.$.baseUri + binding.image[0].$.src,
                width: parseInt(binding.image[0].$.src.split(/\w\=(.*?)\&/)[1]),
                height: parseInt(binding.image[0].$.src.split(/\h\=(.*?)\&/)[1]),
                tileSize: binding.image[0].$.src.split(/tilesize\=(.*?)\&/)[1],
                x: parseInt(binding.image[0].$.src.split(/\x\=(.*?)\&/)[1]),
                y: parseInt(binding.image[0].$.src.split(/\y\=(.*?)/)[2])
            } : null;
            this.bindings[binding.$.template] = {
                image: imageObject,
                text: {
                    hintWrap: binding.text[0].$['hint-wrap'] == 'true',
                    hintStyle: binding.text[0].$['hint-style'],
                    content: binding.text[0]._
                }
            };
        });
    }
}

module.exports = function (options) {
    if (!options || !(options instanceof Object)) options = { market: "en-US", vertical: "news" };
    else if (!options.vertical) options.vertical = "news";
    else if (!options.market) options.market = "en-US";
    const parameters = "?" + Object.entries(options).map(value => `&${value[0]}=${encodeURIComponent(value[1])}`).join("");
    
    return new Promise((resolve) => {
        fetch(`https://assets.msn.com/service/msn/livetile/singletile${parameters}`, res => {
            let string = "";
            res.on("error", err => { throw new Error(err); });
            res.on("data", chunk => string += chunk);
            res.on("end", () => {
                if (res.statusCode != 200) throw new Error(JSON.parse(string).value[0].errorMessage);
                
                parseXML.parseString(string, function(err, result) {
                    if (err) throw new Error(err);
                    resolve(new News(result));
                });
            });
        });
    });
}
