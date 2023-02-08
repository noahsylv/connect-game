
export default function handler(req, res) {
    const { board } = req.query
    fetch(process.env.SERVER + "get_move?board=" + board + "&game_id=1")  
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        // const x = data.json();
        // console.log(x);
        res.status(200).json(data);
    })

    // res.status(200).json({ name: process.env.SERVER })
}
  