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
	

	getUsersFromApi(){
		return this.post(this.buildApiData('users'))
		.then(body => {
			let items = $(body).find('row').toArray().map(item => {
				let $row = $(item);
				
				return { 
					id: parseInt($row.find('id').text()), 
					firstName: $row.find('f_name').text(),
					lastName: $row.find('l_name').text(),
					email: $row.find('email').text(),
					location_id: this.locationId
				};
			});
			return items;
		});
	}
	
	loadUsers(){
		return database.connect().then(db => {
			return db.collection('lavu_users').find({ location_id: this.locationId }).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log('No Lavu users found.  Loading from Lavu...');
					return this.getUsersFromApi()
					.then(users => {
						return db.collection('lavu_users')
							.insertMany(users)
							.then(() => users);
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
					return this.getMenuGroupsFromApi() // this.getMenuCategoriesFromApi()
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
					var user_id = parseInt($row.find('server_id').text());
					
					let details = filter(allDetails, d => d.order_id == order_id);
					
					return { _id, orderId: order_id, location_id, closed, total: total, details: details, user_id };
					
				});
			});
			
		});
	}
	
	loadOrders(minDate, maxDate, refresh){
		
		return database.connect().then(db => {

			const reload = () => {
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
			};
			
			if(refresh) return reload();

			let query = { location_id: this.locationId, closed: { $gte: minDate, $lte: maxDate } };
			console.log('Finding orders...', query);
			return db.collection('lavu_orders').find(query).toArray().then(rows => {
				if(!rows || rows.length == 0){
					console.log(`No Lavu orders found.  Loading from Lavu... ${minDate} - ${maxDate}`);
					return reload();
				}
				return rows;
			});
		});
	}

	getSalesSection(minDate, maxDate)  {
		return this.loadOrders(minDate, maxDate, true)
		.then(orders => this.loadMenuItems(true).then(menuItems => { return { orders, menuItems }; }))
		.then(({orders, menuItems}) => this.loadMenuCategories(true).then(categories => { return { orders, menuItems, categories }; }))
		.then(({orders, menuItems, categories}) => {

			let summary = {
				groups: []
			};
			orders.forEach(order => {
				order.details.forEach(detail => {
					let menuItem = find(menuItems, item => item.id == detail.item_id);
					if (!menuItem){
						console.log('Could not find menu item', detail.item_iod);
					} 
					else {
						let menuCategory = find(categories, cat => cat.id == menuItem.category_id);
						if(!menuCategory){
							console.log('Could not find category', menuItem.category_id);
						}
						else {
							let category = find(categories, cat => cat.id == menuCategory.id);
							if(!category){
								category = { id: menuCategory.id, name: menuCategory.name, count: 0, sales: 0, group_id: menuCategory.group_id };
							}

							if (summary.groups[category.group_id])  {
								summary.groups[category.group_id].count += detail.quantity;
								summary.groups[category.group_id].sales += detail.total;
							} else {
								summary.groups[category.group_id] = {};
								summary.groups[category.group_id].count = detail.quantity;
								summary.groups[category.group_id].sales = detail.total;
							}
						}
					}
				});
			});
			return summary;
		});
			
	}
	
	
	getSalesSummary(minDate, maxDate, refresh){
		return this.loadOrders(minDate, maxDate, refresh)
		.then(orders => this.loadMenuItems(refresh).then(menuItems => { return { orders, menuItems }; }))
		.then(({orders, menuItems}) => this.loadMenuCategories(refresh).then(categories => { return { orders, menuItems, categories }; }))
		.then(({orders, menuItems, categories}) => {
			
			console.log(orders.length, menuItems.length, categories.length);
			
			let summary = {
				totalSales: 0,
				totalOrders: 0,
				categories: [],
				groups: []
			};
			
			orders.forEach(order => {
				summary.totalSales += order.total;
				summary.totalOrders++;
				
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
								category = { id: menuCategory.id, name: menuCategory.name, count: 0, sales: 0, group_id: menuCategory.group_id };
								summary.categories.push(category);
							}

							category.count += detail.quantity;
							category.sales += detail.total;

							if (summary.groups[category.group_id])  {
								summary.groups[category.group_id].count += detail.quantity;
								summary.groups[category.group_id].sales += detail.total;
							} else {
								summary.groups[category.group_id] = {};
								summary.groups[category.group_id].count = detail.quantity;
								summary.groups[category.group_id].sales = detail.total;
							}
						}
					}
				});
			});
			
			return summary;
		});
	}

	getStaffSalesSummary(minDate, maxDate){
		return this.loadUsers()
		.then(users => this.loadOrders(minDate, maxDate).then(orders => ({users, orders})))
		.then(({users, orders}) => this.loadMenuItems().then(menuItems => ({ users, orders, menuItems })))
		.then(({users, orders, menuItems}) => this.loadMenuCategories().then(categories => ({ users, orders, menuItems, categories })))
		.then(({ users, orders, menuItems, categories }) => {
			let staff = [];
			orders.forEach(order => {
				let user = find(users, u => u.id == order.user_id);
				if(!user) return console.log('User not found:', order.user_id);
				
				let s = find(staff, s => s.id == user.id);
				if(!s) { 
					s = { id: user.id, firstName: user.firstName, lastName: user.lastName, totalSales: 0, totalOrders: 0 }; 
					staff.push(s); 
				}
				s.totalSales += order.total;
				s.totalOrders++;
			});
			return staff;
		});

	}

	getWeeklyGoal(){
        return database.connect().then(db => {
        	return db.collection('goals').find({ location_id: this.locationId, type: 'weekly' }).sort({ created_at: -1 }).limit(1).toArray().then(result => result);
        });
    }
    
    setWeeklyGoal(amount){
        return database.connect().then(db => {
            return db.collection('goals').insert({ location_id: this.locationId, type: 'weekly', value: amount, created_at: new Date() });
        });
    }

    getWeeklyIncentive()  {
    	return database.connect().then(db => {
        	return db.collection('incentives').find({ location_id: this.locationId, type: 'weekly' }).sort({ created_at: -1 }).limit(1).toArray().then(result => result);
        });
    }

    setWeeklyIncentive(incentive, goal)  {
    	return database.connect().then(db => {
    		return db.collection('incentives').insert({ location_id: this.locationId, type: 'weekly', id: incentive.id, name: incentive.name, goal: goal, created_at: new Date() });
    	});
    }
};
