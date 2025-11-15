import express from 'express'

const router = express.Router() 
import auth from '../middleware/auth.js'
import outfitpreviews from '../model/outfit-preview.js'
import sharecollection from '../model/sharecollection.js'
router.get('/', auth, async (req, res) => {
    const user =req.user 
    if (!user){return res.status(401).json({message:'Unauthorized'})} 
    const menuimages= await outfitpreviews.find({userid:user._id}).limit(10).select('generatedurl')
    const previews=await sharecollection.find({username:user.username}).limit(10).select('image')
    // if (!menuimages){return res.status(404).json({message:'No images found'})} 
    // random any
    let randoms=[]
    let menucounter=0 
    let previewcounter=0 
    // console.log("menuimages",menuimages.length,previews.length)
    for (let i=0;i<menuimages.length+previews.length;i++){
        let random=Math.floor(Math.random()*2)
        if (random===0){
            if (menuimages[menucounter] && menucounter<menuimages.length){
            randoms.push(menuimages[menucounter])
            menucounter++
            }
            else if (previews[previewcounter] && previewcounter<previews.length){
                randoms.push(previews[previewcounter])
                previewcounter++
            }
        }else if (random===1){
            if (previews[previewcounter] && previewcounter<previews.length){
                randoms.push(previews[previewcounter])
                previewcounter++
            }
            else if (menuimages[menucounter] && menucounter<menuimages.length){
                randoms.push(menuimages[menucounter])
                menucounter++
            }
        }
    } 
    let count=0;
    if (randoms.length<=3){
        console.log("adding more images")
        count++;
        randoms.push({image:`https://picsum.photos/${count*100}/300?grayscale`})
        count++;
        randoms.push({image:`https://picsum.photos/${count*100}/300?grayscale`})
        count++;
        randoms.push({image:`https://picsum.photos/${count*100}/300?grayscale`})
    }
    // console.log("randoms",randoms.length)
    res.status(200).json({randoms:randoms.reverse()})
})
export default router