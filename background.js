var omniboxText = '',
	omniboxSuggest = '',
	isSearching = false,
	searchInterval = null,
	isNewSearch = false;

function encodeXml(s) {
	var holder = document.createElement('div');
	holder.textContent = s;
	return holder.innerHTML;
}

function doSearch() {
	if (isNewSearch && !isSearching) {
		isNewSearch = false;
		isSearching = true;

		console.log('Searching: ' + omniboxText);
		API.get(omniboxText)
			.then(function (data) {
				isSearching = false
				var suggestions = [];
				if (data.list) {
					for (var i in data.list) {
						var item = data.list[i];
						suggestions.push({
							content: item.resolved_url,
							description: encodeXml(item.given_title || item.resolved_title)
						});
					}


					// console.log(suggestions)
					// console.log('send suggestions')
					omniboxSuggest(suggestions.slice(0, 5));
				}
			});
	}
}

chrome.omnibox.onInputStarted.addListener(function () {
	isNewSearch = true;

	if (Auth.isNeeded()) {
		Auth.go();
		return;
	}

	if (!searchInterval) {
		searchInterval = setInterval(doSearch, 500);
	}
});

chrome.omnibox.onInputCancelled.addListener(function () {
	clearInterval(searchInterval);
	searchInterval = null;
});

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	isNewSearch = true;
	omniboxText = text;
	omniboxSuggest = suggest;
});

chrome.omnibox.onInputEntered.addListener(function (text) {
	var query = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(query, function (tabs) {
		if (tabs.length > 0) {
			chrome.tabs.update(tabs[0].id, {
				url: text
			});
		}
	});
});
