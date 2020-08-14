const express = require("express");
const path = require("path");
const fs = require('fs')
const bp = require('body-parser')
const router = express.Router();


router.use(bp.urlencoded({ extended: false }));
router.use(bp.json());

let KWPath = path.join(__dirname, '..','..','..', 'keywords', 'technologies.txt')

let KWList = fs.readFileSync(KWPath).toString().split("\n");

router.route("/")
.get((req, res) => {
    res.json(KWList)
})
.post((req, res) => {
    console.log(req.body)
    let newKW = req.body.keyword
    if(!newKW || KWList.includes(newKW) ) {
        return res.status(400).json({msg: 'Please include a keyword not included in the keyword list'})
    }
    KWList.push(newKW)
    KWList.sort((a, b) => {
        return a.toLocaleLowerCase().trim().localeCompare(b.toLocaleLowerCase().trim())
    })

    let KWString = ""
    KWList.forEach((kw) => {
        KWString += kw
        if(kw !== KWList[KWList.length -1]) {
            KWString += "\n"
        }
    })
    
    res.status(200).json({msg: 'Keyword added'})
    fs.writeFileSync(KWPath,KWString)
})

module.exports = router;
