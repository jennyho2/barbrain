const request = require('request'),
	  { filter, find } = require('lodash'),
	  
	  moment = require('moment');
	  
var $ = require('jquery')(require("jsdom").jsdom().parentWindow);
const database = require('../db');

var api_url = "https://api.poslavu.com/cp/reqserv/";

module.exports = class LavuService {

	configure(datanameString, keyString, tokenString, locationId){
		this.api_url = api_url;
		this.datanameString = datanameString;
		this.keyString = keyString;
		this.tokenString = tokenString;
		this.locationId = locationId;

		if(!this.datanameString) return Promise.reject('No dataname');
		if(!this.keyString) return Promise.reject('No key');
		if(!this.tokenString) return Promise.reject('No token');
		if(!this.locationId) return Promise.reject('No location ID');

		return Promise.resolve(this); // for chaining
	}
	
	post(data){
		return new Promise((resolve, reject) => {
			console.log('Performing API request', data.form.table, this.locationId);
			request.post(this.api_url, data, (error, response, body) => {
				if(error) return reject(error);
				resolve(body);
			});

		});
	}
	
	buildApiData(table, formData = {}){
		if(!this.datanameString) throw new Error('No dataname');
		if(!this.keyString) throw new Error('No key');
		if(!this.tokenString) throw new Error('No token');
		
		return {
			form: Object.assign({ dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: table, valid_xml: 1, limit: 10000 }, formData)
		};
	}
	
	getMenuItemsFromApi(){
		return this.post(this.buildApiData('menu_items'))
		.then(body => {
			let items = $(body).find('row').toArray().map(item => {
				let $row = $(item);
				
				return { 
					id: parseInt($row.find('id').text()), 
					category_id: parseInt($row.find('category_id').text()),
					name: $row.find('name').text(),
					location_id: this.locationId
				}
			});
			return items;
		});
	}
	
	loadMenuItems(){
		return database.connect().then(db => {
			return db.collection('lavu_menu_items').find({ location_id: this.locationId }).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log('No Lavu menu items found.  Loading from Lavu...');
					return this.getMenuItemsFromApi()
					.then(menuItems => {
						return db.collection('lavu_menu_items')
							.insertMany(menuItems)
							.then(() => menuItems);
					});
				}
				return rows;
			});
		});
	}
	
	getMenuCategoriesFromApi(){
		return this.post(this.buildApiData('menu_categories'))
		.then(body => {
			return $(body).find('row').toArray().map(category => {
				let $row = $(category);
				return {
					id: parseInt($row.find('id').text()),
					group_id: parseInt($row.find('group_id').text()),
					name: $row.find('name').text(),
					location_id: this.locationId
				};
			});
		});
	}
	
	loadMenuCategories(){
		return database.connect().then(db => {
			return db.collection('lavu_menu_categories').find({ location_id: this.locationId }).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log('No Lavu menu categories found.  Loading from Lavu...');
					return this.getMenuCategoriesFromApi()
					.then(categories => {
						return db.collection('lavu_menu_categories')
							.insertMany(categories)
							.then(() => categories);
					});
				}
				return rows;
			});
		});
	}
	
	getMenuGroupsFromApi(){
		return this.post(this.buildApiData('menu_groups'))
		.then(body => {
			return $(body).find('row').toArray().map(category => {
				let $row = $(category);
				return {
					id: parseInt($row.find('id').text()),
					name: $row.find('group_name').text(),
					location_id: this.locationId
				};
			});
		});
	}

	
	loadMenuGroups(){
		return database.connect().then(db => {
			return db.collection('lavu_menu_groups').find({ location_id: this.locationId }).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log('No Lavu menu groups found.  Loading from Lavu...');
					return this.getMenuCategoriesFromApi()
					.then(groups => {
						return db.collection('lavu_menu_groups')
							.insertMany(groups)
							.then(() => groups);
					});
				}
				return rows;
			});
		});
	}
	
	getOrderDetailsFromApi(orderId){
		
		let data = { filters: JSON.stringify([{ "field": "order_id", "operator": "IN","value1": orderId}]) };
		return this.post(this.buildApiData('order_contents', data))
		.then(body => body);

	}
	
	getOrdersFromApi(minDate, maxDate){
		let data = { column: "closed", value_min: minDate.toISOString().substring(0, 19).replace('T', ' '), value_max: maxDate.toISOString().substring(0, 19).replace('T', ' ') };
		return this.post(this.buildApiData('orders', data))
		.then(body => {

			var orders = $(body).find('row');
			
			console.log(`Found ${orders.length} orders from ${minDate} to ${maxDate}`);
			
			const allOrderIds = orders.toArray().map(orderRow => $(orderRow).find('order_id').text());
			
			return this.getOrderDetailsFromApi(allOrderIds)
			.then(results => {
				
				return $(results).find('row').toArray().map(detail => {
					
					let $detail = $(detail);
					
					var _id = $detail.find('id').text();
					var order_id = $detail.find('order_id').text();
					var item_id = $detail.find('item_id').text();
					var total = parseFloat($detail.find('total_with_tax').text());
					var quantity = parseFloat($detail.find('quantity').text());
					
					return { _id, order_id, item_id, total, quantity };
				});
			})
			.then(allDetails => {
				
				return orders.toArray().map(orderRow => {
					var $row = $(orderRow);
					var _id = $row.find('id').text();
					var total = parseFloat($row.find('total').text());
					var order_id = $row.find('order_id').text();
					//var location_id = parseInt($row.find('location_id').text());
					var location_id = this.locationId;
					var closed = moment($row.find('closed').text()).toDate();
					
					let details = filter(allDetails, d => d.order_id == order_id);
					
					return { _id, orderId: order_id, location_id, closed, total: total, details: details };
					
				});
			});
			
		});
	}
	
	loadOrders(minDate, maxDate){
		return database.connect().then(db => {
			let query = { location_id: this.locationId, closed: { $gte: minDate, $lte: maxDate } };
			console.log('Finding orders...', query);
			return db.collection('lavu_orders').find(query).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log(`No Lavu orders found.  Loading from Lavu... ${minDate} - ${maxDate}`);
					return this.getOrdersFromApi(minDate, maxDate)
					.then(orders => {
						if(orders.length > 0){
							let bulk = db.collection('lavu_orders').initializeUnorderedBulkOp();
							orders.forEach(order => {
								bulk.find({ _id: order._id }).upsert().updateOne(order);
							});
							return bulk.execute()
								.then(() => orders);
						}
						return orders;
					});
				}
				return rows;
			});
		});

	}
	
	
	getSalesSummary(minDate, maxDate){
		return this.loadOrders(minDate, maxDate)
		.then(orders => this.loadMenuItems().then(menuItems => { return { orders, menuItems }; }))
		.then(({orders, menuItems}) => this.loadMenuCategories().then(categories => { return { orders, menuItems, categories }; }))
		.then(({orders, menuItems, categories}) => {
			
			console.log(orders.length, menuItems.length, categories.length);
			
			let summary = {
				totalSales: 0,
				categories: []
			};
			
			orders.forEach(order => {
				summary.totalSales += order.total;
				
				order.details.forEach(detail => {
					let menuItem = find(menuItems, item => item.id == detail.item_id);
					if(!menuItem){
						console.log('Could not find menu item', detail.item_iod);
					}
					else {
						let menuCategory = find(categories, cat => cat.id == menuItem.category_id);
						if(!menuCategory){
							console.log('Could not find category', menuItem.category_id);
						}
						else {
							let category = find(summary.categories, cat => cat.id == menuCategory.id);
							if(!category){
								category = { id: menuCategory.id, name: menuCategory.name, count: 0, sales: 0 };
								summary.categories.push(category);
							}

							category.count += detail.quantity;
							category.sales += detail.total;
						}
					}
				});
			});
			
			return summary;
		})
	}

	callLavuDaily(responding, callback) {
		var today = new Date();
		today.setHours(3, 0, 0, 0);
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate() + 1);
		console.log("Between: " + today + "and : " + tomorrow);
		request.post(this.api_url, {
			form: { dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: "orders", valid_xml: 1, limit: 10000, column: "closed", value_min: today.toISOString().substring(0, 19).replace('T', ' '), value_max: tomorrow.toISOString().substring(0, 19).replace('T', ' ') }
		}, function(error, response, body) {
			var total = 0;
			responding.incentiveSales = {};
			responding.totalIncentiveSales = 0.0;
			responding.totalIncentiveOrders = 0;
			responding.todayTotalSales = 0.0;
			responding.todayTotalOrders = 0;
			//request.post(this.api_url, {form:{dataname:this.datanameString,key:this.keyString,token:this.tokenString,table:"orders",valid_xml:1,limit:10000,column:"closed",value_min: today.toISOString().substring(0, 19).replace('T', ' '),value_max: tomorrow.toISOString().substring(0, 19).replace('T', ' ') }
			// /console.log("Body: " + body);
			// response.data.querySelectorAll('row');

			responding.todayAverageTicket = responding.todayTotalSales / responding.todayTotalOrders;
			console.log(total);
			callback(responding);
		});
	}
	

	callLavuYesterday(responding, callback) {
		var yesterday = new Date();
		yesterday.setHours(3, 0, 0, 0);
		yesterday.setDate(yesterday.getDate() - 1);
		var today = new Date();
		today.setHours(3, 0, 0, 0);
		
		
		request.post(this.api_url, {
			form: { dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: "orders", valid_xml: 1, limit: 10000, column: "closed", value_min: yesterday.toISOString().substring(0, 19).replace('T', ' '), value_max: today.toISOString().substring(0, 19).replace('T', ' ') }
		}, function(error, response, body) {
			
			
			var total = 0;
			// responding.incentiveSales = {};
			// responding.totalIncentiveSales = 0.0;
			// responding.totalIncentiveOrders = 0;
			responding.yesterdayTotalSales = 0.0;
			responding.yesterdayTotalOrders = 0;
			responding.yesterday = {};
			responding.yesterday.categories = {};
			var orders = $(body).find('row');
			var finished_contents = 1;
			var started_content = 0;
			$(body).find('row').each(function() {
				//  console.log($(this).find('id').text());
				var $row = $(this);
				var id = $row.find('id').text();
				total += parseFloat($row.find('total').text());
				var order_id = $row.find('order_id').text();
				
				
				request.post(this.api_url, {
					form: { dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: "order_contents", valid_xml: 1, limit: 10000, column: "order_id", value: order_id }
				}, function(error2, response2, body2) {
					$(body2).find('row').each(function() {
						var $row2 = $(this);
						var item_id = $row2.find('item_id').text();
						var category_id = items[item_id];
						var group_id = categories[category_id];
						var group_name = groups[group_id];
						if (responding.yesterday.categories.hasOwnProperty(group_name)) {
							responding.yesterday.categories[group_name].sales += parseFloat($row2.find('total_with_tax').text());
							responding.yesterday.categories[group_name].orders += parseFloat($row2.find('quantity').text());
							//console.log($sender.categories);
						}
						else {
							responding.yesterday.categories[group_name] = {};
							responding.yesterday.categories[group_name].name = group_name;
							responding.yesterday.categories[group_name].sales = parseFloat($row2.find('total_with_tax').text());
							responding.yesterday.categories[group_name].orders = parseFloat($row2.find('quantity').text());
							//console.log(responding.categories);
						}
					});
					console.log("starting: " + started_content + " Order length: " + orders.length + " finished content: " + finished_contents);
					if (started_content == orders.length && finished_contents == orders.length) {
						responding.yesterdayAverageTicket = responding.yesterdayTotalSales / responding.yesterdayTotalOrders;
						callback(responding);
					}
					finished_contents++;
				});
				started_content++;
			});

			//callback(responding);
		});
	}

	callLavuWeekly(responding, callback) {
		var d = new Date();
		var day = d.getDay(),
			diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
		var lastMonday = new Date(d.setDate(diff));
		lastMonday.setHours(3, 0, 0, 0);
		var ending = new Date();
		ending.setDate(lastMonday.getDate());
		ending.setHours(2, 59, 59, 999);
		lastMonday.setDate(lastMonday.getDate() - 7);
		request.post(this.api_url, {
			form: { dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: tableString, valid_xml: 1, limit: 10000, column: "closed", value_min: lastMonday.toISOString().substring(0, 19).replace('T', ' '), value_max: ending.toISOString().substring(0, 19).replace('T', ' ') }
		}, function(error, response, body) {
			var total = 0;
			responding.incentiveSales = {};
			responding.totalIncentiveSales = 0.0;
			responding.totalIncentiveOrders = 0;
			responding.weeklyTotalSales = 0.0;
			responding.weeklyTotalOrders = 0;
			responding.categories = {};
			console.log("Body: " + body.data);
			// response.data.querySelectorAll('row');
			$(body.data).find('row').each(function() {
				//  console.log($(this).find('id').text());
				var $row = $(this);
				var id = $row.find('id').text();
				total += parseFloat($row.find('total').text());
				console.log("Here: " + $row.find('total').text());
			});
			responding.weeklyAverageTicket = responding.weeklyTotalSales / responding.weeklyTotalOrders;
			console.log(total);
			callback(responding);
		});
	}

	callLavuMonthly(responding, callback) {
		var date = new Date();
		var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		firstDay.setHours(3, 0, 0, 0);
		var tomorrow = new Date();
		tomorrow.setDate(date.getDate() + 1);
		console.log(firstDay);
		request.post(this.api_url, {
			form: { dataname: this.datanameString, key: this.keyString, token: this.tokenString, table: tableString, valid_xml: 1, limit: 10000, column: "closed", value_min: firstDay.toISOString().substring(0, 19).replace('T', ' '), value_max: tomorrow.toISOString().substring(0, 19).replace('T', ' ') }
		}, function(error, response, body) {
			var total = 0;
			responding.incentiveSales = {};
			responding.totalIncentiveSales = 0.0;
			responding.totalIncentiveOrders = 0;
			responding.monthlyTotalSales = 0.0;
			responding.monthlyTotalOrders = 0;
			responding.categories = {};
			console.log("Body: " + body.data);
			// response.data.querySelectorAll('row');
			$(body.data).find('row').each(function() {
				//  console.log($(this).find('id').text());
				var $row = $(this);
				var id = $row.find('id').text();
				total += parseFloat($row.find('total').text());
				console.log("Here: " + $row.find('total').text());
			});
			responding.monthlyAverageTicket = responding.monthlyTotalSales / responding.monthlyTotalOrders;
			console.log(total);
			callback(responding);
		});
	}
};
