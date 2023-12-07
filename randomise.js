"use strict";

function radioGroupValue(groupName) {
	let radioGroup = document.getElementsByName(groupName);
	let checked = Array.from(radioGroup).find((radio => radio.checked));
	if (checked === undefined) {
		return "";
	} else {
		return checked.value;
	}
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

function chooseScheme(playersConfig) {
	let excludeSchemes = [];
	if ("ExcludeSchemes" in playersConfig) {
		excludeSchemes = [...playersConfig.ExcludeSchemes];
	}
	return chooseRandom(Object.keys(config.Schemes), [], excludeSchemes, 1);	
}

function chooseVillains(playersConfig, alwaysLeads, ignoreAlwaysLeads, schemeConfig) {
	let villainGroups = playersConfig.VillainGroups;
	if ("Remove Villains" in schemeConfig) {villainGroups -= schemeConfig["Remove Villains"];}
	let include = [];
	if (!ignoreAlwaysLeads) {
		include.push(alwaysLeads);
	}
	return chooseRandom(config.Villains, include, [], villainGroups);
}

function chooseHenchmen(playersConfig, schemeConfig) {
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

function chooseVillainHeroes(schemeConfig) {
	let villainHeroes = [];
	if ("Heroes in Villain Deck" in schemeConfig) {
		let total = schemeConfig["Heroes in Villain Deck"];
		let chooseFrom = config.Heroes;
		if ("Heroes to include" in schemeConfig) {
			chooseFrom = [...schemeConfig["Heroes to include"]];
		}
		villainHeroes = chooseRandom(chooseFrom, [], [], total);
	}
	return villainHeroes;
}

function chooseHeroes(villainHeroes, playersConfig, bigBad) {
	if (bigBad == "Angelus") {
		villainHeroes.push("Angel");
	}
	return chooseRandom(config.Heroes, [], villainHeroes, playersConfig.Heroes);
}

function randomise() {
	let text = "<table>";
	
	// Players
	let playersConfig = config.Players[radioGroupValue("players")];	

	// Big bad
	let bigBad = chooseBigBad(playersConfig)[0];
	text += "<tr><td>Big bad</td><td>" + bigBad + "</td></tr>";
	let bigBadConfig = config["Big bads"];
	let alwaysLeads = bigBadConfig[bigBad];
	let ignoreAlwaysLeads = ("IgnoreAlwaysLeads" in playersConfig);

	// Scheme
	let scheme = chooseScheme(playersConfig)[0];
	let schemeConfig = config.Schemes[scheme];
	text += "<tr><td>Scheme</td><td>" + scheme + "</td></tr>";
	
	// Villain deck
	//Scheme twists
	let schemeTwists = schemeConfig["Scheme twists"];
	text += "<tr><td>Scheme twists</td><td>" + schemeTwists + "</td></tr>"
	// Master strikes
	let masterStrikes = playersConfig.MasterStrikes;
	text += "<tr><td>Master strikes</td><td>" + masterStrikes + "</td></tr>";
	// Villains
	let villains = chooseVillains(playersConfig, alwaysLeads, ignoreAlwaysLeads, schemeConfig);
	text += "<tr><td>Villains</td><td>" + villains.join("<br/>") + "</td></tr>";
	// Henchmen
	let henchmen = chooseHenchmen(playersConfig, schemeConfig);
	text += "<tr><td>Henchmen</td><td>"
	if ("HenchmenCards" in playersConfig) {
		text += playersConfig.HenchmenCards + " cards from " + henchmen;
	} else {
		text += henchmen.join("<br/>");
	}
	text += "</td></tr>"
	// Bystanders
	let bystanders = playersConfig.Bystanders;
	text += "<tr><td>Bystanders</td><td>" + bystanders + "</td></tr>";
	// Heroes
	let villainHeroes = chooseVillainHeroes(schemeConfig);
	if (villainHeroes.length > 0) {
		text += "<tr><td>Heroes to include in villain deck</td><td>" + villainHeroes.join("<br/>") + "</td></tr>";
	}
	
	// Hero deck
	let heroes = chooseHeroes(villainHeroes, playersConfig, bigBad);
	text += "<tr><td>Heroes</td><td>" + heroes.join("<br/>") + "</td></tr>";
	
	// Starting courage tokens
	if ("Starting courage tokens per player" in schemeConfig) {
		text += "<tr><td>Starting courage tokens per player</td><td>"
		+ schemeConfig["Starting courage tokens per player"] + "</td></tr>";
	}
	text += "</table>"
	
	document.getElementById("result").innerHTML = text;
}

document.getElementById("randomise").addEventListener("click", randomise);

let config;
fetch("randomise.json")
	.then(response => response.json())
	.then(data => {config = data});

