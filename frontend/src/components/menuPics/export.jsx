import InfiniteMenu from './menu'
import { useEffect,useState } from 'react'; 

const Export = ({
    
}) => {

    const [items,setItems] = useState([]); 
    const apiurl = import.meta.env.VITE_BACKEND_URL;
    const getfromapi =async ()=>{
        const response = await fetch(`${apiurl}/menuimages`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
            },
            credentials: 'include',
        });
        const data = await response.json();
        console.log(data.randoms)
        const setimages=data.randoms.map((item)=>{
            return {
                image: item.image || item.generatedurl,
                link: item.generatedurl || item.image,
                // title: 'Menu Image',
                // description: 'This is a menu image'
            }
        })
        setItems(setimages);
    }
    useEffect(()=>{
        getfromapi();
    },[]); 

    // const itemstemp = [
    //     {
    //       image: 'https://res.cloudinary.com/dvxvgmhyg/image/upload/v1749127379/images/fu0imlsdm5sum455funh.webp',
    //       link: 'https://google.com/',
    //       title: 'Item 1',
    //       description: 'This is pretty cool, right?'
    //     }
        
    //   ];
    return (
        <div style={{ height: '600px', position: 'relative' }}> 
            <InfiniteMenu items={items} />
            {/* {JSON.stringify(items)} */}
        </div>
    )
}
export default Export;