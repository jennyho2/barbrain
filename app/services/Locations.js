const { find } = require('lodash');


const locations = [  
   {  
      name:"ABI - HQ Account",
      datanameString:"anheuser_busch",
      keyString:"pt0iMHVihlZScx2zqxK8",
      tokenString:"krOaMsvLH2Y6OIReo0sz"
   },
   {  
      name:"BBC Cedritos ",
      datanameString:"bogot_beer_com",
      keyString:"CJdJt1QBeZ6btuLHC89o",
      tokenString:"xJojOImrcSatITyVmur9"
   },
   {  
      name:"BBC Bodega Villas",
      datanameString:"_bogot_beer_co",
      keyString:"QC9Ej8FbFrltGW6pccQb",
      tokenString:"eOlDZ5Waz171f72DEp1H"
   },
   {  
      name:"Patagonia Recta Martinoli",
      datanameString:"cerveza_patago",
      keyString:"kn1aDUfMtB94is91R6h2",
      tokenString:"BXi4IZxgbO1KTqcQSQPK"
   },
   {  
      name:"Goose Island Pub",
      datanameString:"goose_island_p",
      keyString:"fUOEUo4DToNuuTLuda04",
      tokenString:"R65QzAE6RnctGY8Dta2n"
   },
   {  
      name:"Bocanegra Tacos &amp; Beer",
      datanameString:"bocanegra_taco",
      keyString:"YwlSjFm6z3krgipJmUyF",
      tokenString:"sdxyd3efTICAGwgRrVZh"
   },
   {  
      name:"BBC Bodega Calle 140",
      datanameString:"bogota_beer_co",
      keyString:"vsdJQPt88xtAREH6qMwG",
      tokenString:"1TL7fb4pPOHrZHNcfS8g"
   },
   {  
      name:"Patagonia CBA Independencia",
      datanameString:"cerveza_patago1",
      keyString:"fucyVjJLezWXEtIvYm8U",
      tokenString:"tEMkgfTCwUKjrSc1BBmI"
   },
   {  
      name:"Patagonia Paseo El Buen Pastor",
      datanameString:"cerveza_patago2",
      keyString:"3wh0KSHOeu8Xd5d4gihE",
      tokenString:"siw6Rb4cYthPtjZ5A5sJ"
   },
   {  
      name:"Cervejaria Bohemia",
      datanameString:"bohemia_menu_2",
      keyString:"r1URVhD9yJjAg83nqTb6",
      tokenString:"BNPs6hPoFIDS2gEQrEOH"
   },
   {  
      name:"Patagonia Distrito Arcos",
      datanameString:"cerveza_patago3",
      keyString:"UNOJVtvrFUaRjZWslaV71",
      tokenString:"BFy48C3dMlOb6EB7wZgA"
   },
   {  
      name:"Patagonia Arenales",
      datanameString:"cerveza_patago4",
      keyString:"6DH7QvmkEshAA9r9D0Sp",
      tokenString:"wHRgz48IbTK4yUq82fDM"
   },
   {  
      name:"Patagonia Eventos",
      datanameString:"cerveza_patago5",
      keyString:"1bKDUaS9XN7BatqAR3eV",
      tokenString:"dCmeaXDT343ealw1X8PU"
   },
   {  
      name:"Birra del Borgo Bancone",
      datanameString:"abi_it_borgoro",
      keyString:"5Qx4GW5ClyQtWLZ2Xnkl",
      tokenString:"7YvgVBDiDEVu7VTxoGiV"
   },
   {  
      name:"Patagonia Av de Mayo",
      datanameString:"cerveza_patago6",
      keyString:"ROTFZLBJnOreSufZ7VLd",
      tokenString:"r3207DpmWYpAssKwrOBG"
   },
   {  
      name:"Patagonia Mapuche",
      datanameString:"cerveza_patago7",
      keyString:"lt84Y6UhmjZbIRm86aIP",
      tokenString:"oYsBqeoAJZLbRtJdJ1rk"
   },
   {  
      name:"Patagonia 54 y 4",
      datanameString:"cerveza_patago8",
      keyString:"H2VSYXGBbauysu0UW9aR",
      tokenString:"MH01cc86uXs2UML7t1Eh"
   },
   {  
      name:"Tap house",
      datanameString:"tap_house1",
      keyString:"pi4KQ8lcKayBhM6SrVgn",
      tokenString:"q7NvkVPEvs36uHQhKNhX"
   },
   {  
      name:"dev_abi_italy",
      datanameString:"dev_abi_italy",
      keyString:"6ahIjcrtAPiWE0p1rvIf",
      tokenString:"MpHJmq5GoCyZYF2wW0ka"
   },
   {  
      name:"L Osteria di Birra del Borgo",
      datanameString:"abi_it_rome",
      keyString:"NNiLpx90L5SqmX7A9kB8",
      tokenString:"Uh4HNcd1ywoiWkp1nYUZ"
   },
   {  
      name:"Patagonia Tejeda 1 y 2",
      datanameString:"cerveza_patago9",
      keyString:"Wut9Y3BigxgEgChgzvNB",
      tokenString:"YjVS0nEgBXI9gSh5dmuC"
   },
   {  
      name:"Patagonia Guemes ",
      datanameString:"cerveza_patago10",
      keyString:"DgoF9ZX2WpaUv97BcpDu",
      tokenString:"y5YcGTi1HnW3g5vbXrTw"
   },
   {  
      name:"PBC Test",
      datanameString:"pbc_test",
      keyString:"adsEM8BeeDw5y5bT3RVE",
      tokenString:"Rk8VUyp2BtVMj90GAT4z"
   },
   {  
      name:"Aduana Cucapa Fork Off",
      datanameString:"cucapa_fork_of",
      keyString:"5vZUuUJIN1lG8fYFEzku",
      tokenString:"s7uI7ZQUfJkwSkX2dVDM"
   },
   {  
      name:"Aduana Cucapa Sonny Diaz",
      datanameString:"cucapa_sonny_d",
      keyString:"4Ava0JznFPX9bQVWPvTg",
      tokenString:"uCsLuzQwGdTNT3pNx6iP"
   },
   {  
      name:"Patagonia Maschwitz",
      datanameString:"cerveza_patago11",
      keyString:"vAxDc1oRMlNJOMtwQrnd",
      tokenString:"xcyaY3xrCdI8zoJAkfCd"
   },
   {  
      name:"ABI - UK - TEST",
      datanameString:"abi_uk_test",
      keyString:"pt0iMHVihlZScx2zqxK8",
      tokenString:"krOaMsvLH2Y6OIReo0sz"
   },
   {  
      name:"Patagonia Bariloche",
      datanameString:"cerveza_patago13",
      keyString:"XCXxRHUsSuF3n3D4s6Lm",
      tokenString:"bsn9GpsHt8UClvnEukGa"
   },
   {  
      name:"Patagonia Nordelta",
      datanameString:"cerveza_patago14",
      keyString:"M8QwoJGzTU7f3eWWIRVv",
      tokenString:"BYXrSduzdowayKngRnYC"
   },
   {  
      name:"Patagonia Don Anselmo",
      datanameString:"cerveza_patago15",
      keyString:"ws99gVUCw9GApRc4mFkG",
      tokenString:"DfBSFLdgUzzuMbixhb16"
   },
   {  
      name:"Patagonia Mexico y Peru",
      datanameString:"cerveza_patago16",
      keyString:"aJNXnxhEGpjBodxBQw9f",
      tokenString:"uyulMnzyE8yDD3mQLGeL"
   },
   {  
      name:"Patagonia Pasteur y Viamonte",
      datanameString:"cerveza_patago17",
      keyString:"WDoHpXU9aBd7hN13Tv86",
      tokenString:"XVkuL6u5cRue3kbArISp"
   },
   {  
      name:"Patagonia Paraguay y Uruguay",
      datanameString:"cerveza_patago18",
      keyString:"FN1UdR4TKcD7TrWh709E",
      tokenString:"nrePDGTR71DiZc4V0CwD"
   },
   {  
      name:"Patagonia Av. Córdoba y MB",
      datanameString:"cerveza_patago19",
      keyString:"65IAkaNwfvSHdmHw0rq9",
      tokenString:"biKzIEat8KRiPN2bo1TF"
   },
   {  
      name:"Patagonia Paraguay y Riobamba",
      datanameString:"cerveza_patago20",
      keyString:"9AE1laSQPw6p8CKBVAjZ",
      tokenString:"PB5V2JqY4LfgjlcJGjqs"
   },
   {  
      name:"Patagonia Callao 650",
      datanameString:"cerveza_patago21",
      keyString:"vYRN68P1OtRbOTHvGb9j",
      tokenString:"CU2gXmJESQmxe0GtJDcG"
   },
   {  
      name:"Patagonia La Normandina",
      datanameString:"cerveza_patago22",
      keyString:"VCThPLrczen4Sj8C89OP",
      tokenString:"4ov4kO0BHnAltCWEDJNr"
   },
   {  
      name:"Patagonia Costa Salguero",
      datanameString:"cerveza_patago23",
      keyString:"XFv76rBvA90WWHUP7beW",
      tokenString:"MMHytp6EPE11dEHDZAqf"
   },
   {  
      name:"Aduana Cucapa Tamps 236",
      datanameString:"cucapa_tamauli1",
      keyString:"RxwLtbXPtghaf9JaQnXH",
      tokenString:"hzSjuHTwrOf72iKB6m7p"
   },
   {  
      name:"Aduana Cucapá San José Insurgentes",
      datanameString:"mx040007",
      keyString:"RxwLtbXPtghaf9JaQnXH",
      tokenString:"hzSjuHTwrOf72iKB6m7p"
   },
   {  
      name:"Expendio Tijuana",
      datanameString:"mx030001",
      keyString:"RxwLtbXPtghaf9JaQnXH",
      tokenString:"hzSjuHTwrOf72iKB6m7p"
   },
   {  
      name:"Corona Bar",
      datanameString:"uk040005",
      keyString:"SuQrZEFbDyJYh15AZboq",
      tokenString:"LjiXTYVeGAqsMUb97TP8"
   },
   {  
      name:"ABI Place Holder Account",
      datanameString:"abi_place_hold",
      keyString:"WBHl600chLyOT7zXffvq",
      tokenString:"g78a4XgNBMR3kruFGGcV"
   },
   {  
      name:"Patagonia La Plata 59 y 7",
      datanameString:"ar040045",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   },
   {  
      name:"ABI South Africa Test",
      datanameString:"abi_south_afri",
      keyString:"bmYdmakDEGA59rBQAUtI",
      tokenString:"qsh5GIJT8cubzdGldw7E"
   },
   {  
      name:"Patagonia Barrio Jardin",
      datanameString:"ar040047",
      keyString:"ODv8jXN7K7PS3ZBEvIES",
      tokenString:"8w9jBM6zXi45vlKQU0uz"
   },
   {  
      name:"UY PAT World Trade Center",
      datanameString:"uy020001",
      keyString:"Sdh47G5JegrVNLi1Ags3",
      tokenString:"rhUCepyqszXNUtyUlWjE"
   },
   {  
      name:"UY PAT Mercado del Puerto",
      datanameString:"uy040002",
      keyString:"llrgqsvpoIIMf5HpHSyJ",
      tokenString:"XNmu9CB824o87CyvZB7h"
   },
   {  
      name:"UY PAT Arocena",
      datanameString:"uy040003",
      keyString:"3Wro6HWnLIt6ub1ZD5IZ",
      tokenString:"lbhvfb4jMv9wpROTLFws"
   },
   {  
      name:"UY PAT Parque Miramar",
      datanameString:"uy040004",
      keyString:"c2Mqvv6JTfbal2nfpXGz",
      tokenString:"66RCtnkaA8WzvMKhRbhh"
   },
   {  
      name:"UY POC 40 Montevideo 1",
      datanameString:"uy040008",
      keyString:"tyW2PigMA5gZbTWSltrG",
      tokenString:"PWnwqHMPUeI9vIGcSdW1"
   },
   {  
      name:"UY POC 41 Montevideo 2 POC 41",
      datanameString:"uy040009",
      keyString:"oBMl7146MdaO6kNzdXDT",
      tokenString:"1T9zttAEpHANbnREbMat"
   },
   {  
      name:"UY Ciudad Vieja",
      datanameString:"uy040010",
      keyString:"Qpe0r6Wi0S2GcJOq7Ns1",
      tokenString:"FAH7Dnz1tHYhcrbilDkL"
   },
   {  
      name:"Aduana Cucapa Picanteria I",
      datanameString:"cucapa_picante",
      keyString:"Usd6xbmxZ2bsMv9Qjtmt",
      tokenString:"IJJG4nkMA8Mg4Fvdje3s"
   },
   {  
      name:"Aduana Cucapá Picantería II",
      datanameString:"mx40009",
      keyString:"GcdA9rZEi6oZJR6sYGco",
      tokenString:"qCcXZ79jGk7OyhLgzcHd"
   },
   {  
      name:"PY PAT Recoleta",
      datanameString:"py030001",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   },
   {  
      name:"PY PAT Carmelitas",
      datanameString:"py040002",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   },
   {  
      name:"PY POC 34 Lambare",
      datanameString:"py040006",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   },
   {  
      name:"PY PAT San Bernardino/Eventos",
      datanameString:"py040004",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   },
   {  
      name:"PY PAT Encarnacion/Catolica",
      datanameString:"py040003",
      keyString:"cIQiGVoy2jyUShaRNkJF",
      tokenString:"Sjj6yf9sr2DK31f9FzI7"
   }];



module.exports = class LocationService {
    all(){
        return Promise.resolve(locations);
    }
    
    resolve(id){
    	let location = find(locations, l => l.datanameString == id);
    	if(location) return Promise.resolve(location);
    	return Promise.reject('Unknown Location');
    }
};