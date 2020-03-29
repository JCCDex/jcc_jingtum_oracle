


let arr = [
    {s: 1,t: 'ttt'}
];
//arr[7] = 7;
//arr[6] = 6;
console.log(arr);
function arrindexof(arr,arv,value){
 for(i=0; i < arr.length; i++){
    if(arr[i][arv] == value){
        console.log("==");
    } 

 }
 console.log(arr)
}

arrindexof(arr,"s",1)