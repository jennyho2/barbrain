
module.exports = class LocationService {
    resolve(id){
    	if (id == 0) { // bariloche
    		console.log("Choosing Bariloche");
    		return {
        		datanameString: "cerveza_patago13",
        		keyString: "XCXxRHUsSuF3n3D4s6Lm",
        		tokenString: "bsn9GpsHt8UClvnEukGa",
        		locationId: 1
    		};
    	}
    	else if (id == 1) { // tejeda
    		console.log("Choosing Tejeda");
    		return {
        		datanameString: "cerveza_patago9",
        		keyString: "Wut9Y3BigxgEgChgzvNB",
        		tokenString: "YjVS0nEgBXI9gSh5dmuC",
        		locationId: null
    		};
    	}
    	else if (id == 2) { // goose island
    		console.log("Choosing Goose Island");
    		return {
        		datanameString: "goose_island_p",
        		keyString: "fUOEUo4DToNuuTLuda04",
        		tokenString: "R65QzAE6RnctGY8Dta2n",
        		locationId: null
    		};
    	}
    }
};