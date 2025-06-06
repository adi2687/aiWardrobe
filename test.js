const clothes="* Shirt:Light:Cotton/Polyester:Pink * Shirt:Dark:Cotton/Polyester:Burgundy * Shirt:Light:Cotton/Polyester:Beige * Shirt:Dark:Cotton/Polyester:Dark Grey * Shirt:Light:Cotton/Polyester:Light Grey * Sweater:Mid:Cotton/Wool:Dark Grey * Pants/Skirt:Mid:Cotton/Polyester:Grey * Sweater:Mid:Cotton/Wool:Dark Red"
const preclothes=clothes.split('*')
console.log(preclothes)
let cloth=[]
let material=[]
let color=[]
for (let i=0;i<preclothes.length;i++){
    if (preclothes[i]!=''){
    const clothesmodified=preclothes[i].split(':')
    // console.log(clothesmodified)
    cloth.push(clothesmodified[0])
    material.push(clothesmodified[1])
    color.push(clothesmodified[2])
    }
}
console.log(cloth)
console.log(material)
console.log(color)
