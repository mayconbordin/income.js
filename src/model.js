var Model = {};

Model.Item = (function() {
	return {
		list: function(callback) {
			var data = [
				{id: 12, name: "Receita Operaciona Bruta", type: "group"},
				{id: 13, name: "Receita de Vendas", type: "account"},
				{id: 14, name: "(-) Deduções", type: "group"},
				{id: 15, name: "(=) Receita Operacional Líquida", type: "result"},
				{id: 16, name: "Outras Despesas", type: "account"}
			];
			
			callback(data);
		},
		
		save: function(data, callback) {
			$.ajax({
			  type: 'POST',
			  url: "http://localhost:3000/items/create",
			  data: data,
			  success: callback,
			  error: callback,
			  dataType: "json"
			});
		}
	};
})();

Model.IncomeStatement = (function() {
	var id = null,
		type = null,
		beforeSave = null,
		afterSave = null;
		
	var buffer = {items:{}};
	var sending = false;
	
	return {
		get: function(id, callback) {
		    /*
			$.ajax({
  				url: "http://localhost:3000/income_statements/show/" + id,
  				dataType: 'json',
  				success: callback
			});
			*/
			var dre = {
				id: id,
				start_date: new Date("2012/01/01"),
				end_date: new Date("2012/12/31"),
				items:[
					{id:1, order: 0, type:"group", name:"Receita Operaciona Bruta", value:40000, items:[
						{id:2, order: 1, type:"account",name:"Receita de Vendas", value: 40000}
					]},
					{id:3, order: 2, type:"group", name:"(-) Deduções", value: 5000, items:[
						{id:4, order: 3, type:"account", name:"ICMS s/ Vendas", value: 5000}
					]},
					{id:5, order: 4, type:"result", name:"(=) Receita Operacional Líquida", value: 35000, funct: "$group_1 - $group_3"},
					{id:6, order: 5, type:"group", name:"(-) Despesas", value: 2500, items:[
						{id:7, order: 6, type:"account", name:"Salários", value: 2000},
						{id:8, order: 7, type:"account", name:"Encargos Sociais", value: 500}
					]},
					{id:9, order: 8, type:"group", name:"(+) Outras Receitas", value: 2000, items:[
						{id:10, order: 9, type:"account", name:"Juros Ativos", value: 1000},
						{id:12, order: 10, type:"account", name:"Outros Juros", value: 1000}
					]},
					{id:11, order: 11, type:"result", name:"(=) Resultado Líquido do Exercício", value: 34500, funct: "$result_5 - $group_6 + $group_9"}
				]
			};
			
			if (callback) callback(dre);
		},
		
		destroy: function(id, callback) {
			$.ajax({
			  type: 'DELETE',
			  url: "http://localhost:3000/income_statements/destroy/" + id,
			  success: callback,
			});
		},
		
		getItemHistory: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/income_statements/list_item_history/" + id,
  				dataType: 'json',
  				success: function(data) {
  					for (i in data)
  						data[i][0] = new Date(data[i][0]);
  						
  					callback(data);
  				}
			});
		},
		
		newVersion: function(obj, callback) {
			$.ajax({
				type: 'POST',
			 	url: "http://localhost:3000/projections/new_version",
			  	data: obj,
			  	dataType: "json",
			  	success: callback
			});
		},
		
		getVersions: function(id, callback) {
			$.ajax({
  				url: "http://localhost:3000/income_statements/list_versions/" + id,
  				dataType: 'json',
  				success: callback
			});
		},
		
		saveInfo: function(obj, callback) {
			$.ajax({
				type: 'POST',
			 	url: "http://localhost:3000/income_statements/save_info",
			  	data: obj,
			  	dataType: "json",
			  	success: function() {
					if (callback) callback("success");
				},
				error: function() {
					if (callback) callback("error");
				}
			});
		},
		
		setSaveCallbacks: function(b, a) {
			beforeSave = b;
			afterSave = a;
		},
		
		setId: function(isId) {
			id = isId;
			buffer.id = id;
		},
		
		setType: function(isType) {
			type = isType;
			buffer.type = isType;
		},
		
		save: function(item) {
			var data = {items:{}};
			data.items[item.id] = item;
			data.id = id;
			
			// a little experiment
			if (buffer.items[item.id])
				$.extend(buffer.items[item.id], item);
			else
				buffer.items[item.id] = item;
			
			if (!sending) {
				Model.IncomeStatement.sendData();
				sending = true;
			}
		},
		
		sendData: function(callback) {
			if (beforeSave)
				beforeSave();
				
			console.log("saving...");
			
			$.ajax({
				type: 'POST',
			 	url: "http://localhost:3000/income_statements/save",
			  	data: buffer,
			  	dataType: "json",
			  	success: function() {
					if (afterSave)
						afterSave({date: new Date(), success: true});
						
					if (callback)
						callback("success");
				},
				error: function() {
					if (callback)
						callback("error");
				}
			});
			
			setTimeout(function() {
				Model.IncomeStatement.sendData();
			}, 15000);
		},
		
		printBuffer: function() {
			console.log(buffer);
		}
	};
})();
