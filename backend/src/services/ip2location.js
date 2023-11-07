const {IP2Location} = require("ip2location-nodejs");
let ip2location;

const errorValues = ['INVALID_IP_ADDRESS', '-', 'MISSING_FILE'];

const init = () => {
    ip2location = new IP2Location();
    ip2location.open("../data/ip2location.bin");
}

exports.getISOLocationCodeByIp = (ip) => {
    init();
    const location = ip2location.getCountryShort(ip);
    ip2location.close();
    return errorValues.indexOf(location) !== -1 ? 'xx' : location.toLowerCase();
}

exports.getLocationByIp = (ip) => {
    init();
    let short = ip2location.getCountryShort(ip);
    let long = ip2location.getCountryLong(ip);
    ip2location.close();
    short = errorValues.indexOf(short) !== -1 ? 'xx' : short.toLowerCase();
    long = errorValues.indexOf(long) !== -1 ? 'Unknown' : long;
    return {
        iso: short,
        ext: long
    }
}