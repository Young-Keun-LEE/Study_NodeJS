import {odd, even} from './var.mjs';

function checkOddEven(num){
    if(num % 2){
        return odd;
    }
    return even;
}

export default checkOddEven;