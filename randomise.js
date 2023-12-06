"use strict";

function RadioGroupValue(groupName) {
	let radioGroup = document.getElementsByName(groupName);
	let checked = Array.from(radioGroup).find((radio => radio.checked));
	if (checked === undefined) {
		return "";
	} else {
		return checked.value;
	}
}

function Shuffle(array) {
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

function ChooseRandom (array, include, exclude, total) {
	Shuffle(array);
	let item;
	let items = [...include];
	let count = items.length;
	for (let i = 0; i < array.length; i++) {
		if (count >= total) {break;}
		item = array[i];
		if (!(exclude.includes(item)) && !(items.includes(item))) {
			items.push(item);
			count++;
		}
	}
	return items.sort();
}

function ChooseBigBad() {
	return ChooseRandom(Object.keys(config["Big bads"]), [], [], 1);	
}

function ChooseScheme(players_config) {
	let exclude_schemes = [];
	if ("ExcludeSchemes" in players_config) {exclude_schemes = [...players_config.ExcludeSchemes];}
	return ChooseRandom(Object.keys(config.Schemes), [], exclude_schemes, 1);	
}

function ChooseVillains(players_config, always_leads, ignore_always_leads, scheme_config) {
	let villain_groups = players_config.VillainGroups;
	if ("Remove Villains" in scheme_config) {villain_groups -= scheme_config["Remove Villains"];}
	let include = [];
	if (!ignore_always_leads) {include.push(always_leads);}
	return ChooseRandom(config.Villains, include, [], villain_groups);
}

function ChooseHenchmen(players_config, scheme_config) {
	let henchmen_groups;
	if ("HenchmenCards" in players_config) {
		henchmen_groups = 1
	} else {
		henchmen_groups = players_config.HenchmenGroups;
	}
	let include = [];
	if ("Include henchmen" in scheme_config) {include = [...scheme_config["Include henchmen"]];}
	return ChooseRandom(config.Henchmen, include, [], henchmen_groups);	
}

function ChooseVillainHeroes(scheme_config) {
	let villain_heroes = [];
	if ("Heroes in Villain Deck" in scheme_config) {
		let total = scheme_config["Heroes in Villain Deck"];
		let choose_from = config.Heroes;
		if ("Heroes to include" in scheme_config) {
			choose_from = [...scheme_config["Heroes to include"]];
		}
		villain_heroes = ChooseRandom(choose_from, [], [], total);
	}
	return villain_heroes;
}

function ChooseHeroes(villain_heroes, players_config, big_bad) {
	if (big_bad == "Angelus") {villain_heroes.push("Angel");}
	return ChooseRandom(config.Heroes, [], villain_heroes, players_config.Heroes);
}

function Randomise() {
	let text = "<table>";
	
	// Players
	let players_config = config.Players[RadioGroupValue("players")];	

	// Big bad
	let big_bad = ChooseBigBad(players_config)[0];
	text += "<tr><td>Big bad</td><td>" + big_bad + "</td></tr>";
	let big_bad_config = config["Big bads"];
	let always_leads = big_bad_config[big_bad];
	let ignore_always_leads = ("IgnoreAlwaysLeads" in players_config);

	// Scheme
	let scheme = ChooseScheme(players_config)[0];
	let scheme_config = config.Schemes[scheme];
	text += "<tr><td>Scheme</td><td>" + scheme + "</td></tr>";
	
	// Villain deck
	//Scheme twists
	let scheme_twists = scheme_config["Scheme twists"];
	text += "<tr><td>Scheme twists</td><td>" + scheme_twists + "</td></tr>"
	// Master strikes
	let master_strikes = players_config.MasterStrikes;
	text += "<tr><td>Master strikes</td><td>" + master_strikes + "</td></tr>";
	// Villains
	let villains = ChooseVillains(players_config, always_leads, ignore_always_leads, scheme_config);
	text += "<tr><td>Villains</td><td>" + villains.join("<br/>") + "</td></tr>";
	// Henchmen
	let henchmen = ChooseHenchmen(players_config, scheme_config);
	text += "<tr><td>Henchmen</td><td>"
	if ("HenchmenCards" in players_config) {
		text += players_config.HenchmenCards + " cards from " + henchmen;
	} else {
		text += henchmen.join("<br/>");
	}
	text += "</td></tr>"
	// Bystanders
	let bystanders = players_config.Bystanders;
	text += "<tr><td>Bystanders</td><td>" + bystanders + "</td></tr>";
	// Heroes
	let villain_heroes = ChooseVillainHeroes(scheme_config);
	if (villain_heroes.length > 0) {
		text += "<tr><td>Heroes to include in villain deck</td><td>" + villain_heroes.join("<br/>") + "</td></tr>";
	}
	
	// Hero deck
	let heroes = ChooseHeroes(villain_heroes, players_config, big_bad);
	text += "<tr><td>Heroes</td><td>" + heroes.join("<br/>") + "</td></tr>";
	
	// Starting courage tokens
	if ("Starting courage tokens per player" in scheme_config) {
		text += "<tr><td>Starting courage tokens per player</td><td>"
		+ scheme_config["Starting courage tokens per player"] + "</td></tr>";
	}
	text += "</table>"
	
	document.getElementById("result").innerHTML = text;
}

document.getElementById("randomise").addEventListener("click", Randomise);

let config;
fetch("randomise.json").then(response => response.json()).then(data => {config = data});

