console.log('Script for Fetch');

async function getData(url){
    const response = await fetch(url);
    const json = await response.json()
    return json;
}

console.log(getData('../../../test/data/data.json'));