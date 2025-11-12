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
    if (!menuimages){return res.status(404).json({message:'No images found'})} 
    // random 10
    let randoms=[]
    console.log("menuimages",menuimages)
    for (let i=0;i<10;i++){
        let random=Math.floor(Math.random()*2)
        if (random===0){
            if (menuimages[i]){
            randoms.push(menuimages[i])
            }
            else if (previews[i]){
                randoms.push(previews[i])
            }
        }else if (random===1){
            if (previews[i]){
                randoms.push(previews[i])
            }
            else if (menuimages[i]){
                randoms.push(menuimages[i])
            }
        }
    } 
    console.log("randoms",randoms,randoms.length)
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
    res.status(200).json({randoms})
})
export default router