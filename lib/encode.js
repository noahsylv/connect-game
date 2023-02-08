export function encodeGame(board, n) {
    var out = "";
    [...Array(n).keys()].forEach((row) => {
        var count = 0;
        [...Array(n).keys()].forEach((col) => {
            if (board[[row, col]] === "Empty") {
                count += 1;
            } else {
                out += (count > 0 ? count : "") + board[[row, col]].substring(0, 1);
                count = 0;
            }
        })
        out += "l";
    });
    return out;
}