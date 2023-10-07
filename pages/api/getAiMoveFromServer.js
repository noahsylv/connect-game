
export default function handler(req, res) {
    const { board, player } = req.query
    console.log("trying to get move for board " + board);
    console.log("api is " + process.env.SERVER + "get_move?board=" + board + "&player="+player[0])
    fetch(process.env.SERVER + "get_move?board=" + board + "&player="+player[0])  
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        // const x = data.json();
        // console.log(x);
        res.status(200).json(data);
    })

    // res.status(200).json({ name: process.env.SERVER })
}
  