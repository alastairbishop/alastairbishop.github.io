"use strict";

function dropDownText(dropDownName) {
	let e = document.getElementById(dropDownName);
	return e.options[e.selectedIndex].text;
}

function storeOption(optionName) {
	localStorage.setItem(optionName, document.getElementById(optionName).value);
}

function retrieveOption(optionName) {
	if (localStorage.getItem(optionName)) {
		document.getElementById(optionName).value = localStorage.getItem(optionName);
	} else {
		storeOption(optionName);
	}
}

function retrieveOptions() {
	retrieveOption("players");
	retrieveOption("alwaysLeads");
}

function storeOptions() {
	storeOption("players");
	storeOption("alwaysLeads");
}

function buildDropdown(elementName, dropdownName, options, label) {
	let html = '<label for="' + dropdownName + '" class="dropdownLabel">' + label + '</label>';
	html += '<select name="' + dropdownName + '" id="' + dropdownName + '">';
	for (let i = 0; i < options.length; i++) {
		html += '<option value="' + options[i] + '"';
		if (i == 0) {
			html += ' selected="selected"';
		}
		html += '>' + options[i] + '</option>';
	}
	html += '</select>';
	document.getElementById(elementName).innerHTML = html;
}

function buildOptions() {
	buildDropdown("playersDropdown", "players", Object.keys(config.Players).sort(), "Players");
	buildDropdown("alwaysLeadsDropdown", "alwaysLeads", ["Standard", "Always", "Never"], "Enforce Always Leads");
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function chooseRandom (array, include, exclude, total) {
	shuffle(array);
	let item;
	let items = [...include];
	let count = items.length;
	for (let i = 0; i < array.length; i++) {
		if (count >= total) {
			break;
		}
		item = array[i];
		if (!(exclude.includes(item)) && !(items.includes(item))) {
			items.push(item);
			count++;
		}
	}
	return items.sort();
}

function chooseBigBad() {
	return chooseRandom(Object.keys(config["Big bads"]), [], [], 1);	
}

function chooseScheme() {
	let excludeSchemes = [];
	if ("ExcludeSchemes" in playersConfig) {
		excludeSchemes = [...playersConfig.ExcludeSchemes];
	}
	return chooseRandom(Object.keys(config.Schemes), [], excludeSchemes, 1);	
}

function chooseVillains(alwaysLeads, ignoreAlwaysLeads) {
	let villainGroups = playersConfig.VillainGroups;
	if ("Remove Villains" in schemeConfig) {villainGroups -= schemeConfig["Remove Villains"];}
	let include = [];
	let alwaysLeadsOption = document.getElementById("alwaysLeads").value;
	let enforceAlwaysLeads;
	if (alwaysLeadsOption == "Always") {
		enforceAlwaysLeads = true;
	} else if (alwaysLeadsOption == "Never") {
		enforceAlwaysLeads = false;
	} else {
		enforceAlwaysLeads = !ignoreAlwaysLeads;
	}
	if (enforceAlwaysLeads) {
		include.push(alwaysLeads);
	}
	return chooseRandom(config.Villains, include, [], villainGroups);
}

function chooseHenchmen() {
	let henchmenGroups;
	if ("HenchmenCards" in playersConfig) {
		henchmenGroups = 1
	} else {
		henchmenGroups = playersConfig.HenchmenGroups;
	}
	let include = [];
	if ("Include henchmen" in schemeConfig) {
		include = [...schemeConfig["Include henchmen"]];
	}
	return chooseRandom(config.Henchmen, include, [], henchmenGroups);	
}

function chooseVillainHeroes(bigBad) {
	let villainHeroes = [];
	let excludeHeroes = [];
	if (bigBad == "Angelus") {
		excludeHeroes.push("Angel");
	}
	if ("Heroes in Villain Deck" in schemeConfig) {
		let total = schemeConfig["Heroes in Villain Deck"];
		let chooseFrom = config.Heroes;
		if ("Heroes to include" in schemeConfig) {
			chooseFrom = [...schemeConfig["Heroes to include"]];
		}
		villainHeroes = chooseRandom(chooseFrom, [], excludeHeroes, total);
	}
	return villainHeroes;
}

function chooseHeroes(excludeHeroes, bigBad) {
	if (bigBad == "Angelus") {
		excludeHeroes.push("Angel");
	}
	return chooseRandom(config.Heroes, [], excludeHeroes, playersConfig.Heroes);
}

function randomise() {
	let html = "<table>";
	
	// Players
	playersConfig = config.Players[dropDownText("players")];	

	// Big bad
	let bigBad = chooseBigBad()[0];
	html += "<tr><td>Big bad</td><td>" + bigBad + "</td></tr>";
	let bigBadConfig = config["Big bads"];
	let alwaysLeads = bigBadConfig[bigBad];
	let ignoreAlwaysLeads = ("IgnoreAlwaysLeads" in playersConfig);

	// Scheme
	let scheme = chooseScheme()[0];
	schemeConfig = config.Schemes[scheme];
	html += "<tr><td>Scheme</td><td>" + scheme + "</td></tr>";
	
	// Villain deck
	//Scheme twists
	let schemeTwists = schemeConfig["Scheme twists"];
	html += "<tr><td>Scheme twists</td><td>" + schemeTwists + "</td></tr>"
	// Master strikes
	let masterStrikes = playersConfig.MasterStrikes;
	html += "<tr><td>Master strikes</td><td>" + masterStrikes + "</td></tr>";
	// Villains
	let villains = chooseVillains(alwaysLeads, ignoreAlwaysLeads);
	html += "<tr><td>Villains</td><td>" + villains.join("<br/>") + "</td></tr>";
	// Henchmen
	let henchmen = chooseHenchmen();
	html += "<tr><td>Henchmen</td><td>"
	if ("HenchmenCards" in playersConfig) {
		html += playersConfig.HenchmenCards + " cards from " + henchmen;
	} else {
		html += henchmen.join("<br/>");
	}
	html += "</td></tr>"
	// Bystanders
	let bystanders = playersConfig.Bystanders;
	html += "<tr><td>Bystanders</td><td>" + bystanders + "</td></tr>";
	// Heroes in villain deck
	let villainHeroes = chooseVillainHeroes(bigBad);
	if (villainHeroes.length > 0) {
		html += "<tr><td>Heroes to include in villain deck</td><td>" + villainHeroes.join("<br/>") + "</td></tr>";
	}
	
	// Hero deck
	let heroes = chooseHeroes(villainHeroes, bigBad);
	html += "<tr><td>Heroes</td><td>" + heroes.join("<br/>") + "</td></tr>";
	
	// Starting courage tokens
	if ("Starting courage tokens per player" in schemeConfig) {
		html += "<tr><td>Starting courage tokens per player</td><td>"
		+ schemeConfig["Starting courage tokens per player"] + "</td></tr>";
	}
	html += "</table>"
	
	document.getElementById("result").innerHTML = html;
}


let config;
let playersConfig;
let schemeConfig;

fetch("randomise.json")
	.then(response => response.json())
	.then(data => {
		config = data
		buildOptions();

		retrieveOptions();

		document.getElementById("randomise").addEventListener("click", randomise);
		document.getElementById("players").addEventListener("change", storeOptions);
		document.getElementById("alwaysLeads").addEventListener("change", storeOptions);
		
	});

