exports.getErrorFromCode = function (code) {
    switch (code) {
        case 11000:
        case 112:
            return 102;
        case 211:
        case 11600:
        default:
            return 103;
    }
}