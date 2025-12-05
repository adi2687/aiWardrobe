import express from 'express'
import axios from 'axios';
import * as cheerio from 'cheerio';
const router = express.Router(); 

router.post('/',async (req,res)=>{
    const {url} = req.body;
    const { data } = await axios.get(url);
    // console.log(data)
    const $ = cheerio.load(data);
    // console.log($)
    const titles = [];
    $("img").each((_, el) => {
      titles.push($(el).attr("src"));
    });
    console.log(titles)
    res.json({image:titles[0]})

})

export default router;