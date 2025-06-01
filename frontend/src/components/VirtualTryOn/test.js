import * as math from 'mathjs'


const M = [
    [100, 50, 1, 0, 0, 0],
    [0, 0, 0, 100, 50, 1],
    [150, 50, 1, 0, 0, 0],
    [0, 0, 0, 150, 50, 1],
    [120, 120, 1, 0, 0, 0],
    [0, 0, 0, 120, 120, 1]
  ];

const B = [400, 300, 500, 320, 460, 450];

const M_inv=math.inv(M)
const T=math.multiply(M_inv,B)

console.log(T)